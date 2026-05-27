/**
 * fix-pagos-entregados.js
 *
 * Actualiza los registros de mantenimiento cuyos dispositivos están en estado
 * "Entregado" para que tengan datos de pago coherentes (Pagado).
 *
 * Ejecutar: node fix-pagos-entregados.js
 */

const pool = require('./src/database/connection');

// Costos realistas por tipo de dispositivo
const costosPorTipo = {
  Portatil:    [85000, 120000, 150000, 180000, 220000, 95000, 135000],
  Computadora: [70000, 90000, 110000, 130000, 160000, 75000, 100000],
  Tablet:      [60000, 80000, 95000, 110000, 55000, 75000],
  Pantalla:    [45000, 60000, 75000, 50000, 65000],
  Proyector:   [90000, 120000, 150000, 100000, 140000],
  Impresora:   [55000, 70000, 85000, 65000, 80000],
};
const costoDefault = [70000, 90000, 110000, 130000, 80000];

// Fechas de pago distribuidas en los últimos 6 meses
function fechaPagoAleatoria() {
  const ahora  = new Date();
  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - 6);
  const diff = ahora.getTime() - inicio.getTime();
  return new Date(inicio.getTime() + Math.random() * diff);
}

function pad(n) { return String(n).padStart(2, '0'); }

function formatFecha(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function elegirCosto(tipo) {
  const lista = costosPorTipo[tipo] || costoDefault;
  return lista[Math.floor(Math.random() * lista.length)];
}

const run = async () => {
  try {
    console.log('🔍 Buscando dispositivos en estado "Entregado"...\n');

    // 1. Obtener todos los dispositivos en estado Entregado
    const [entregados] = await pool.query(`
      SELECT d.id AS dispositivo_id, d.nombre, d.tipo, d.serial
      FROM dispositivos d
      JOIN estados e ON d.estado_id = e.id
      WHERE e.nombre = 'Entregado'
      ORDER BY d.id
    `);

    if (entregados.length === 0) {
      console.log('⚠️  No se encontraron dispositivos en estado "Entregado".');
      process.exit(0);
    }

    console.log(`✅ Encontrados ${entregados.length} dispositivos en estado "Entregado"\n`);

    let creados    = 0;
    let actualizados = 0;

    for (const disp of entregados) {
      const costo     = elegirCosto(disp.tipo);
      const fechaPago = fechaPagoAleatoria();
      const fechaStr  = formatFecha(fechaPago);

      // Buscar si ya tiene mantenimiento
      const [mantRows] = await pool.query(
        `SELECT * FROM mantenimiento WHERE dispositivo_id = ? ORDER BY id DESC LIMIT 1`,
        [disp.dispositivo_id]
      );

      if (mantRows.length === 0) {
        // No tiene mantenimiento → crear uno completo con pago
        const referencia    = `MANT-ENT-${disp.dispositivo_id}-${Date.now().toString().slice(-6)}`;
        const transaccion   = `TXN-${Math.random().toString(36).substring(2,10).toUpperCase()}`;

        await pool.query(`
          INSERT INTO mantenimiento
            (dispositivo_id, descripcion, costo, estado_mantenimiento,
             estado_pago, referencia_pago, transaccion_id, fecha_pago)
          VALUES (?, ?, ?, 'Completado', 'Pagado', ?, ?, ?)
        `, [
          disp.dispositivo_id,
          `Mantenimiento completado - ${disp.nombre} (${disp.serial})`,
          costo,
          referencia,
          transaccion,
          fechaStr
        ]);

        console.log(`  ➕ CREADO   | ${disp.nombre.padEnd(35)} | $${costo.toLocaleString('es-CO').padStart(10)} | ref: ${referencia}`);
        creados++;

      } else {
        const mant = mantRows[0];

        // Ya tiene mantenimiento — actualizar campos de pago
        const referencia  = mant.referencia_pago  || `MANT-ENT-${disp.dispositivo_id}-${Date.now().toString().slice(-6)}`;
        const transaccion = mant.transaccion_id   || `TXN-${Math.random().toString(36).substring(2,10).toUpperCase()}`;
        const costoFinal  = (mant.costo && parseFloat(mant.costo) > 0) ? mant.costo : costo;
        const fechaFinal  = mant.fecha_pago ? mant.fecha_pago : fechaStr;

        await pool.query(`
          UPDATE mantenimiento
          SET
            costo                = ?,
            estado_mantenimiento = 'Completado',
            estado_pago          = 'Pagado',
            referencia_pago      = ?,
            transaccion_id       = ?,
            fecha_pago           = ?
          WHERE id = ?
        `, [costoFinal, referencia, transaccion, fechaFinal, mant.id]);

        console.log(`  ✏️  ACTUALIZADO | ${disp.nombre.padEnd(35)} | $${Number(costoFinal).toLocaleString('es-CO').padStart(10)} | ref: ${referencia}`);
        actualizados++;
      }
    }

    console.log('\n─────────────────────────────────────────────────');
    console.log(`✅ Proceso completado:`);
    console.log(`   • Registros creados:     ${creados}`);
    console.log(`   • Registros actualizados: ${actualizados}`);
    console.log(`   • Total procesados:       ${creados + actualizados}`);
    console.log('─────────────────────────────────────────────────\n');

    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
