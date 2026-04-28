const db = require("../database/connection");

const Correo = {
  crear: (data) => {
    // data: [destinatario, asunto, mensaje, fecha_envio, hora_envio, usuario_id]
    return db.query(
      "INSERT INTO correos (destinatario, asunto, mensaje, fecha_envio, hora_envio, usuario_id) VALUES (?, ?, ?, ?, ?, ?)",
      data
    );
  },

  obtenerTodos: () => {
    return db.query(`
      SELECT c.*, u.nombre AS usuario_nombre
      FROM correos c
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY c.id DESC
    `);
  }
};

module.exports = Correo;