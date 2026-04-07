const express = require("express");
const router = express.Router();
const correoController = require("../controllers/correo.controller");

router.post("/enviar", correoController.enviarCorreo);
router.get("/", correoController.obtenerCorreos);

module.exports = router;