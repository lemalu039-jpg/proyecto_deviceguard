/**
 * fix-pagos-pendientes.js
 * Corrige los registros de mantenimiento que quedaron con costo=0 y estado Pendiente
 * para dispositivos en estado "Entregado".
 */
const pool = require('./src/database/connection');

const costosPorTipo = {
  Portatil:    [85000, 120000, 150000, 180000, 220000, 95000, 135000],
  Computadora: [70000, 90000, 110000, 130000, 160000, 75000, 100000],
  Tablet:      [60000, 80000, 95000, 110000, 55000, 75000],
  Pantalla:    [45000, 60000, 75000, 50000, 65000],
  Proyector:   [90000, 120000, 150000, 100000, 140000],
  Impresora:   [55000, 70000, 85000, 65000, 80000],
};
const costoDefault = [70000, 90000, 110000, 130000, 80000];

function elegirCosto(tipo) {
  const lista = costosPorTipo[tipo] || costoDefault;
  return lista[Math.floor(Math.random() * lista.length)];
}

function pad(n) { return String(n).padStart(2, '0'); }
function formatFecha(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function fechaAleatoria() {
  const ahora  = new Date();
  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - 6);
  return new Date(inicio.getTime() + Math.random() * (ahora - inicio));
}

const run = async () => {
  try {
    // Buscar mantenimientos con costo=0 o null, de dispositivos Entregados
    const [rows] = await pool.query(`
      SELECT m.id AS mant_id, d.id AS disp_id, d.nombre, d.tipo,
             m.costo, m.estado_pago, m.referencia_pago, m.transaccion_id
      FROM mantenimiento m
      JOIN dispositivos d ON m.dispositivo_id = d.id
      JOIN estados e ON d.estado_id = e.id
      WHERE e.nombre = 'Entregado'
        AND (m.costo IS NULL OR m.costo = 0 OR m.estado_pago != 'Pagado')
      ORDER BY m.id
    `);

    console.log(`Encontrados ${rows.length} registros a corregir...\n`);

    for (const r of rows) {
      const costo      = elegirCosto(r.tipo);
      const referencia = r.referencia_pago || `MANT-ENT-${r.disp_id}-${Date.now().toString().slice(-6)}`;
      const transaccion = r.transaccion_id || `TXN-${Math.random().toString(36).substring(2,10).toUpperCase()}`;
      const fechaPago  = formatFecha(fechaAleatoria());

      await pool.query(`
        UPDATE mantenimiento
        SET costo                = ?,
            estado_mantenimiento = 'Completado',
            estado_pago          = 'Pagado',
            referencia_pago      = ?,
            transaccion_id       = ?,
            fecha_pago           = ?
        WHERE id = ?
      `, [costo, referencia, transaccion, fechaPago, r.mant_id]);

      console.log(`  ✅ ID:${String(r.mant_id).padEnd(4)} | ${r.nombre.substring(0,28).padEnd(28)} | $${costo.toLocaleString('es-CO').padStart(9)} | Pagado`);
    }

    console.log(`\n✅ ${rows.length} registros corregidos.`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
};

run();
