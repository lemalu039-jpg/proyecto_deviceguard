const express = require("express");
const router = express.Router();

const {
  generarReporteUsuarios,
  generarReporteDispositivos,
  generarReporteBD
} = require("../controllers/reportes.controller");


router.get("/usuarios", generarReporteUsuarios);
router.get("/dispositivos", generarReporteDispositivos);
router.get("/bd", generarReporteBD);

router.get("/", (req, res) => {
  res.send("REPORTES BASE FUNCIONA");
});

module.exports = router;