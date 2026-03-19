const express = require("express");
const router = express.Router();

const {
  generarExcelUsuarios,
  generarExcelDispositivos,
  generarExcelBD
} = require("../controllers/reportes.controller");



router.get("/usuarios-excel", generarExcelUsuarios);
router.get("/dispositivos-excel", generarExcelDispositivos);
router.get("/bd-excel", generarExcelBD);

router.get("/", (req, res) => {
  res.send("REPORTES BASE FUNCIONA");
});

module.exports = router;