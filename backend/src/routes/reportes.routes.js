const express = require("express");
const router = express.Router();

const {
  generarExcelUsuarios,
  generarExcelDispositivos,
} = require("../controllers/reportes.controller");



router.get("/usuarios-excel", generarExcelUsuarios);
router.get("/dispositivos-excel", generarExcelDispositivos);
console.log("Usuarios:", generarExcelUsuarios);
console.log("Dispositivos:", generarExcelDispositivos);

router.get("/", (req, res) => {
  res.send("REPORTES BASE FUNCIONA");
});

module.exports = router;