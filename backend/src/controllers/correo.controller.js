const nodemailer = require("nodemailer");

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

    await transporter.sendMail(mailOptions);

    res.json({ message: "Correo enviado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar correo" });
  }
};