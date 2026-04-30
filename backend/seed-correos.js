const pool = require('./src/database/connection');

// Mensajes por estado del dispositivo
const mensajesPorEstado = {
  'En Revision': (d) => ({
    asunto: 'Dispositivo en revisión — DeviceGuard',
    mensaje: `Su dispositivo "${d.nombre}" (Serial: ${d.serial}) ha ingresado al sistema y se encuentra en revisión inicial.`,
  }),
  'En Mantenimiento': (d) => ({
    asunto: 'Inicio de mantenimiento — DeviceGuard',
    mensaje: `Su dispositivo "${d.nombre}" (Serial: ${d.serial}) ha iniciado proceso de mantenimiento. Le notificaremos cuando esté listo.`,
  }),
  'Listo para Entrega': (d) => ({
    asunto: 'Mantenimiento finalizado — DeviceGuard',
    mensaje: `Su dispositivo "${d.nombre}" (Serial: ${d.serial}) ha completado el mantenimiento y está listo para ser retirado.`,
  }),
  'Entregado': (d) => ({
    asunto: 'Dispositivo entregado — DeviceGuard',
    mensaje: `Su dispositivo "${d.nombre}" (Serial: ${d.serial}) ha sido entregado correctamente. Gracias por confiar en DeviceGuard.`,
  }),
};

// Genera una hora aleatoria entre 07:00 y 18:00
const horaAleatoria = () => {
  const h = Math.floor(Math.random() * 11) + 7;
  const m = Math.floor(Math.random() * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Genera una fecha aleatoria entre fecha_registro y hoy
const fechaAleatoria = (fechaBase) => {
  const base = fechaBase ? new Date(fechaBase) : new Date('2026-01-01');
  const hoy  = new Date();
  const diff = hoy - base;
  const offset = Math.floor(Math.random() * diff);
  const fecha = new Date(base.getTime() + offset);
  return fecha.toISOString().split('T')[0];
};

const seed = async () => {
  try {
    console.log('📧 Generando historial de correos por usuario...\n');

    // Obtener usuario de Lucía Lema para excluirlo
    const [luciaRows] = await pool.query(
      "SELECT id FROM usuarios WHERE nombre LIKE '%Lucia%' OR nombre LIKE '%Lucía%' LIMIT 1"
    );
    const luciaId = luciaRows[0]?.id || null;
    console.log(`⏭  Excluyendo usuario_id: ${luciaId} (Lucía Lema)\n`);

    // Obtener todos los usuarios con rol 'usuario' excepto Lucía
    const [usuarios] = await pool.query(
      "SELECT id, nombre, correo FROM usuarios WHERE rol = 'usuario' AND id != ?",
      [luciaId || 0]
    );

    let totalInsertados = 0;

    for (const usuario of usuarios) {
      // Obtener dispositivos activos de este usuario
      const [dispositivos] = await pool.query(
        `SELECT d.id, d.nombre, d.serial, d.fecha_registro, e.nombre AS estado
         FROM dispositivos d
         LEFT JOIN estados e ON d.estado_id = e.id
         WHERE d.usuario_id = ? AND d.activo = 1`,
        [usuario.id]
      );

      if (dispositivos.length === 0) continue;

      for (const disp of dispositivos) {
        const estado = disp.estado;
        if (!mensajesPorEstado[estado]) continue;

        // Verificar si ya existe un correo para este usuario + dispositivo
        const [existe] = await pool.query(
          "SELECT id FROM correos WHERE usuario_id = ? AND mensaje LIKE ? LIMIT 1",
          [usuario.id, `%${disp.serial}%`]
        );
        if (existe.length > 0) continue; // ya tiene correo, no duplicar

        const { asunto, mensaje } = mensajesPorEstado[estado](disp);
        const fecha = fechaAleatoria(disp.fecha_registro);
        const hora  = horaAleatoria();

        await pool.query(
          "INSERT INTO correos (destinatario, asunto, mensaje, fecha_envio, hora_envio, usuario_id) VALUES (?, ?, ?, ?, ?, ?)",
          [usuario.correo, asunto, mensaje, fecha, hora, usuario.id]
        );
        totalInsertados++;
      }

      console.log(`✔ ${usuario.nombre} — ${dispositivos.length} dispositivo(s) procesado(s)`);
    }

    console.log(`\n🎉 Listo. ${totalInsertados} correos insertados.`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seed();
