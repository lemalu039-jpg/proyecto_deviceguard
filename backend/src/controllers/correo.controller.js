const nodemailer = require("nodemailer");
const db = require("../database/connection"); // IMPORTANTE
const Correo = require("../models/correo");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.enviarCorreo = async (req, res) => {
  try {
    const { destino, asunto, mensaje } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destino,
      subject: asunto,
      text: mensaje
    };

    //Enviar correo
    const info = await transporter.sendMail(mailOptions);
console.log("Correo enviado:", info.response);

    //Guardar en BD
    const ahora = new Date();

    await db.query(
      "INSERT INTO correos (destinatario, asunto, mensaje, fecha_envio, hora_envio) VALUES (?, ?, ?, ?, ?)",
      [
        destino,
        asunto,
        mensaje,
        ahora.toISOString().split("T")[0],
        ahora.toTimeString().slice(0, 5)
      ]
    );
    console.log("Correo enviado y guardado en BD");
const result = await db.query(
  "INSERT INTO correos (destinatario, asunto, mensaje, fecha_envio, hora_envio) VALUES (?, ?, ?, ?, ?)",
  [
    destino,
    asunto,
    mensaje,
    ahora.toISOString().split("T")[0],
    ahora.toTimeString().slice(0, 5)
  ]
);

console.log("INSERT BD:", result);

    res.json({ message: "Correo enviado y guardado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar correo" });
  }
};

exports.obtenerCorreos = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM correos ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener correos" });
  }
};