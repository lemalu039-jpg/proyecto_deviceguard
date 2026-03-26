const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarCorreo = async ({ destinatario, asunto, mensaje }) => {
  try {
    const info = await transporter.sendMail({
      from: `"DeviceGuard" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      text: mensaje,
    });

    console.log("Correo enviado:", info.messageId);
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
};

module.exports = { enviarCorreo };