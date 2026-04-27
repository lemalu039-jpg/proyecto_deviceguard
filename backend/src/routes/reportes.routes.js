const express = require("express");
const router = express.Router();

const {
  generarExcelUsuarios,
  generarExcelDispositivos,
  generarPdfUsuarios,
  generarPdfDispositivos,
  previewUsuarios,
  previewDispositivos,
  obtenerContador,
} = require("../controllers/reportes.controller");

// EXCEL
router.get("/usuarios-excel", generarExcelUsuarios);
router.get("/dispositivos-excel", generarExcelDispositivos);

// PDF
router.get("/usuarios-pdf", generarPdfUsuarios);
router.get("/dispositivos-pdf", generarPdfDispositivos);

// PREVIEW (vista previa con filtro de búsqueda)
router.get("/preview/usuarios", previewUsuarios);
router.get("/preview/dispositivos", previewDispositivos);

// CONTADOR de reportes generados
router.get("/contador", obtenerContador);

router.get("/", (req, res) => {
  res.send("REPORTES BASE FUNCIONA");
});

module.exports = router;
