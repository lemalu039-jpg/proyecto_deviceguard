const PDFDocument = require("pdfkit");
const db = require("../database/connection");

const generarReporteDispositivos = async (req, res) => {
  try {
    const [dispositivos] = await db.query("SELECT * FROM dispositivos");

    if (!dispositivos || dispositivos.length === 0) {
      return res.status(404).send("No hay dispositivos en la base de datos");
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=dispositivos.pdf");

    doc.pipe(res);

    // 🧠 ENCABEZADO
    doc.fontSize(25).text("DEVICEGUARD", { align: "center" });
    doc.moveDown();
    doc.fontSize(18).text("Reporte de Dispositivos", { align: "center" });
    doc.moveDown();

    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString()}`, {
      align: "right"
    });

    doc.moveDown();
    doc.text("----------------------------------------");
    doc.moveDown();

    // 🔁 DATOS
    dispositivos.forEach((d, index) => {
      doc.fontSize(12).text(
        `${index + 1}. ${d.nombre || "Sin nombre"} - ${d.estado || "N/A"}`
      );
      doc.moveDown();
    });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el reporte");
  }
};

const generarReporteBD = async (req, res) => {
  try {
    const [usuarios] = await db.query("SELECT COUNT(*) as total FROM usuarios");
    const [dispositivos] = await db.query("SELECT COUNT(*) as total FROM dispositivos");

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=bd.pdf");

    doc.pipe(res);

    doc.fontSize(25).text("DEVICEGUARD", { align: "center" });
    doc.moveDown();

    doc.fontSize(18).text("Reporte General del Sistema", { align: "center" });
    doc.moveDown();

    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString()}`, {
      align: "right"
    });

    doc.moveDown();
    doc.text("----------------------------------------");
    doc.moveDown();

    doc.fontSize(12).text(`Total de usuarios: ${usuarios[0].total}`);
    doc.text(`Total de dispositivos: ${dispositivos[0].total}`);

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el reporte");
  }
};

const generarReporteUsuarios = async (req, res) => {
  try {

    const [usuarios] = await db.query("SELECT * FROM usuarios");

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).send("No hay usuarios en la base de datos");
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=usuarios.pdf");

    doc.pipe(res);

    doc.fontSize(25).text("DEVICEGUARD", { align: "center" });
    doc.moveDown();
    doc.fontSize(20).text("Reporte de Usuarios", { align: "center" });
    doc.moveDown();
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.moveDown();
    doc.moveDown();

    usuarios.forEach((usuario, index) => {
      doc.text(
        `${index + 1}. ${usuario.nombre} - ${usuario.correo} (${usuario.rol})`
      );
      doc.moveDown();
    });

    doc.end();

  } catch (error) {
    console.error("❌ ERROR REAL:", error);
    res.status(500).send("Error al generar el reporte");
  }
};

module.exports = {
  generarReporteUsuarios,
  generarReporteDispositivos,
  generarReporteBD
};