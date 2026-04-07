const db = require("../database/connection");

const Correo = {
  crear: (data) => {
    return db.query(
      "INSERT INTO correos (destinatario, asunto, mensaje, fecha_envio, hora_envio) VALUES (?, ?, ?, ?, ?)",
      data
    );
  },

  obtenerTodos: () => {
    return db.query("SELECT * FROM correos ORDER BY id DESC");
  }
};

module.exports = Correo;