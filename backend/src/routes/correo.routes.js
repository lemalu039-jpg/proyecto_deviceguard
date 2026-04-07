const express = require("express");
const router = express.Router();
const correoController = require("../controllers/correo.controller");

// Correos externos (Nodemailer)
router.post("/enviar", correoController.enviarCorreo);
router.get("/", correoController.obtenerCorreos);

// Mensajería interna
router.post("/mensajes", correoController.enviarMensaje);
router.get("/mensajes/conversacion/:userId/:contactId", correoController.obtenerConversacion);
router.get("/mensajes/contactos/:userId", correoController.obtenerContactos);

module.exports = router;
