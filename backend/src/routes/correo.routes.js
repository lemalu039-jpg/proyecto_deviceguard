const express = require("express");
const router = express.Router();
const correoController = require("../controllers/correo.controller");

router.post("/enviar", correoController.enviarCorreo);

module.exports = router;