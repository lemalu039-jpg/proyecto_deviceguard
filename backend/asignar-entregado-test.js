/**
 * asignar-entregado-test.js
 * Muestra los usuarios disponibles y los dispositivos Entregados,
 * para que puedas asignar uno al usuario con el que estás probando.
 *
 * Uso: node asignar-entregado-test.js <usuario_id>
 * Ejemplo: node asignar-entregado-test.js 30
 */
const pool = require('./src/database/connection');

const run = async () => {
  const targetUserId = process.argv[2];

  // Mostrar usuarios con rol 'usuario'
  const [usuarios] = await pool.query(
    `SELECT id, nombre, correo FROM usuarios WHERE rol = 'usuario' ORDER BY id LIMIT 20`
  );
  console.log('\n👥 Usuarios disponibles (rol=usuario):');
  usuarios.forEach(u => console.log(`  ID:${u.id} | ${u.nombre.padEnd(30)} | ${u.correo}`));

  // Mostrar dispositivos Entregados
  const [entregados] = await pool.query(`
    SELECT d.id, d.nombre, d.usuario_id, u.nombre AS usuario_actual
    FROM dispositivos d
    JOIN estados e ON d.estado_id = e.id
    LEFT JOIN usuarios u ON d.usuario_id = u.id
    WHERE e.nombre = 'Entregado'
    ORDER BY d.id
    LIMIT 10
  `);
  console.log('\n📦 Dispositivos Entregados:');
  entregados.forEach(d => console.log(`  ID:${d.id} | ${d.nombre.padEnd(30)} | asignado a: ${d.usuario_actual || 'SIN USUARIO'} (id:${d.usuario_id})`));

  if (!targetUserId) {
    console.log('\n💡 Para asignar un dispositivo Entregado a un usuario, ejecuta:');
    console.log('   node asignar-entregado-test.js <usuario_id>');
    process.exit(0);
  }

  // Asignar el primer dispositivo Entregado al usuario indicado
  const disp = entregados[0];
  if (!disp) {
    console.log('\n❌ No hay dispositivos Entregados.');
    process.exit(1);
  }

  await pool.query('UPDATE dispositivos SET usuario_id = ? WHERE id = ?', [targetUserId, disp.id]);
  console.log(`\n✅ Dispositivo ID:${disp.id} (${disp.nombre}) asignado al usuario ID:${targetUserId}`);
  console.log('   Ahora inicia sesión con ese usuario y verás el badge "Pagado" en el Dashboard.');

  process.exit(0);
};

run().catch(e => { console.error(e.message); process.exit(1); });
