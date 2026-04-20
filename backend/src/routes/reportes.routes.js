const express = require("express");
const router = express.Router();

const {
  generarExcelUsuarios,
  generarExcelDispositivos,
  generarPdfUsuarios,
  generarPdfDispositivos,
} = require("../controllers/reportes.controller");

// EXCEL
router.get("/usuarios-excel", generarExcelUsuarios);
router.get("/dispositivos-excel", generarExcelDispositivos);

// PDF
router.get("/usuarios-pdf", generarPdfUsuarios);
router.get("/dispositivos-pdf", generarPdfDispositivos);

console.log("Usuarios:", generarExcelUsuarios);
console.log("Dispositivos:", generarExcelDispositivos);

router.get("/", (req, res) => {
  res.send("REPORTES BASE FUNCIONA");
});

module.exports = router;