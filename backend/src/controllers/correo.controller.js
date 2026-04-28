const nodemailer = require("nodemailer");
const db = require("../database/connection");

exports.enviarCorreo = async (req, res) => {
  try {
    const { destino, asunto, mensaje } = req.body;

    // Crear transporter aquí para que .env ya esté cargado
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"DeviceGuard" <${process.env.EMAIL_USER}>`,
      to: destino,
      subject: asunto,
      text: mensaje
    });

    // Buscar usuario_id por correo destinatario
    let usuario_id = null;
    try {
      const [rows] = await db.query("SELECT id FROM usuarios WHERE correo = ? LIMIT 1", [destino]);
      if (rows.length > 0) usuario_id = rows[0].id;
    } catch (_) {}

    const ahora = new Date();
    await db.query(
      "INSERT INTO correos (destinatario, asunto, mensaje, fecha_envio, hora_envio, usuario_id) VALUES (?, ?, ?, ?, ?, ?)",
      [destino, asunto, mensaje, ahora.toISOString().split("T")[0], ahora.toTimeString().slice(0, 5), usuario_id]
    );

    res.json({ message: "Correo enviado y guardado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar correo" });
  }
};

exports.obtenerCorreos = async (req, res) => {
  try {
    const usuario_id = req.query.usuario_id;
    let rows;
    if (usuario_id) {
      [rows] = await db.query(
        "SELECT * FROM correos WHERE usuario_id = ? ORDER BY id DESC",
        [usuario_id]
      );
    } else {
      [rows] = await db.query("SELECT * FROM correos ORDER BY id DESC");
    }
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener correos" });
  }
};

// ── Mensajería interna ──────────────────────────────────────────────────────

exports.enviarMensaje = async (req, res) => {
  try {
    const { remitente_id, destinatario_id, mensaje } = req.body;
    await db.query(
      "INSERT INTO mensajes_internos (remitente_id, destinatario_id, mensaje) VALUES (?, ?, ?)",
      [remitente_id, destinatario_id, mensaje]
    );
    res.json({ message: "Mensaje enviado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
};

exports.obtenerConversacion = async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    const [rows] = await db.query(
      `SELECT m.*, u.nombre AS remitente_nombre
       FROM mensajes_internos m
       JOIN usuarios u ON u.id = m.remitente_id
       WHERE (m.remitente_id = ? AND m.destinatario_id = ?)
          OR (m.remitente_id = ? AND m.destinatario_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, contactId, contactId, userId]
    );
    // Marcar como leídos los mensajes recibidos
    await db.query(
      "UPDATE mensajes_internos SET leido = 1 WHERE destinatario_id = ? AND remitente_id = ? AND leido = 0",
      [userId, contactId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener conversación" });
  }
};

exports.obtenerContactos = async (req, res) => {
  try {
    const { userId } = req.params;
    // Usuarios con quienes se ha tenido conversación + no leídos
    const [rows] = await db.query(
      `SELECT u.id, u.nombre, u.correo,
        (SELECT COUNT(*) FROM mensajes_internos m
         WHERE m.remitente_id = u.id AND m.destinatario_id = ? AND m.leido = 0) AS no_leidos
       FROM usuarios u
       WHERE u.id != ?
       ORDER BY u.nombre ASC`,
      [userId, userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener contactos" });
  }
};