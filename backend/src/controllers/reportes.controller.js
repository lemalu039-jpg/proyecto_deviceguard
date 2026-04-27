const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const db = require("../database/connection");

// ── Contador en memoria (persiste mientras el servidor esté activo) ──
let contadorReportes = 0;

const incrementarContador = () => { contadorReportes++; };

const obtenerContador = (req, res) => {
  res.json({ total: contadorReportes });
};

// ── Vista previa de usuarios ──
const previewUsuarios = async (req, res) => {
  try {
    const { busqueda } = req.query;
    let query = "SELECT id, nombre, correo, rol, fecha_creacion FROM usuarios WHERE 1=1";
    const params = [];
    if (busqueda) {
      query += " AND (nombre LIKE ? OR correo LIKE ? OR rol LIKE ?)";
      const like = `%${busqueda}%`;
      params.push(like, like, like);
    }
    query += " ORDER BY id DESC LIMIT 200";
    const [rows] = await db.query(query, params);
    res.json({ total: rows.length, datos: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener vista previa de usuarios" });
  }
};

// ── Vista previa de dispositivos ──
const previewDispositivos = async (req, res) => {
  try {
    const { busqueda } = req.query;
    let query = `
      SELECT d.id, d.nombre, d.serial, COALESCE(e.nombre, 'Sin estado') AS estado,
             u.nombre AS usuario, d.fecha_registro
      FROM dispositivos d
      LEFT JOIN estados e ON d.estado_id = e.id
      LEFT JOIN usuarios u ON d.usuario_id = u.id
      WHERE d.activo = 1
    `;
    const params = [];
    if (busqueda) {
      query += " AND (d.nombre LIKE ? OR d.serial LIKE ? OR e.nombre LIKE ? OR u.nombre LIKE ?)";
      const like = `%${busqueda}%`;
      params.push(like, like, like, like);
    }
    query += " ORDER BY d.id DESC LIMIT 200";
    const [rows] = await db.query(query, params);
    res.json({ total: rows.length, datos: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener vista previa de dispositivos" });
  }
};

const generarExcelDispositivos = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query = "SELECT * FROM dispositivos WHERE 1=1";
    const params = [];
    if (desde) { query += " AND DATE(fecha_registro) >= ?"; params.push(desde); }
    if (hasta) { query += " AND DATE(fecha_registro) <= ?"; params.push(hasta); }

    const [dispositivos] = await db.query(query, params);

    if (!dispositivos || dispositivos.length === 0) {
      return res.status(404).send("No hay dispositivos en la base de datos");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Dispositivos");


    // 📊 COLUMNAS (ajústalas si tu tabla es diferente)
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nombre", key: "nombre", width: 25 },
      { header: "Estado", key: "estado", width: 20 },
      { header: "Fecha Entrada", key: "fecha_entrada", width: 25 },
      { header: "Fecha Salida", key: "fecha_salida", width: 25 }
    ];

    // 📥 DATOS
    dispositivos.forEach(d => {
  const fechaEntrada = d.fecha_registro
    ? `${d.fecha_registro.toISOString().split("T")[0]} ${d.hora_registro || "00:00"}`
    : "N/A";

  const fechaSalida = d.fecha_salida
    ? `${d.fecha_salida.toISOString().split("T")[0]} ${d.hora_salida || "00:00"}`
    : "N/A";

  worksheet.addRow({
    id: d.id,
    nombre: d.nombre,
    estado: d.estado,
    fecha_entrada: fechaEntrada,
    fecha_salida: fechaSalida
  });
});

    worksheet.getRow(1).font = { bold: true };

    // 📤 RESPUESTA
    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora  = ahora.toTimeString().slice(0, 5).replace(":", "-");
    const nombreArchivo = `reporte_dispositivos_${fecha}_${hora}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${nombreArchivo}`);

    await workbook.xlsx.write(res);
    incrementarContador();
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar Excel");
  }
};

const generarExcelUsuarios = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query = "SELECT * FROM usuarios WHERE 1=1";
    const params = [];
    if (desde) { query += " AND DATE(fecha_creacion) >= ?"; params.push(desde); }
    if (hasta) { query += " AND DATE(fecha_creacion) <= ?"; params.push(hasta); }

    const [usuarios] = await db.query(query, params);

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).send("No hay usuarios en la base de datos");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Usuarios");

    // 📊 ENCABEZADOS
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nombre", key: "nombre", width: 25 },
      { header: "Correo", key: "correo", width: 30 },
      { header: "Rol", key: "rol", width: 15 }
    ];

    // 📥 DATOS
    usuarios.forEach(usuario => {
      worksheet.addRow({
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      });
    });

    // 🎨 ESTILO
    worksheet.getRow(1).font = { bold: true };

    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora  = ahora.toTimeString().slice(0, 5).replace(":", "-");
    const nombreArchivo = `reporte_usuarios_${fecha}_${hora}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${nombreArchivo}`);

    await workbook.xlsx.write(res);
    incrementarContador();
    res.end();

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Error al generar Excel");
  }
};

const generarPdfDispositivos = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query = "SELECT * FROM dispositivos WHERE 1=1";
    const params = [];
    if (desde) { query += " AND DATE(fecha_registro) >= ?"; params.push(desde); }
    if (hasta) { query += " AND DATE(fecha_registro) <= ?"; params.push(hasta); }

    const [dispositivos] = await db.query(query, params);

    if (!dispositivos || dispositivos.length === 0) {
      return res.status(404).send("No hay dispositivos en la base de datos");
    }

    const doc = new PDFDocument();
    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora = ahora.toTimeString().slice(0, 5).replace(":", "-");
    const nombreArchivo = `reporte_dispositivos_${fecha}_${hora}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${nombreArchivo}`);

    doc.pipe(res);

    doc.fontSize(18).font("Helvetica-Bold").text("Reporte de Dispositivos", { align: "center" });
    doc.fontSize(10).text(`Generado: ${ahora.toLocaleString()}`, { align: "center" });
    doc.moveDown();

    const columnWidth = 90;
    const startX = 50;
    const startY = doc.y;
    const headers = ["ID", "Nombre", "Estado", "Fecha Entrada", "Fecha Salida"];

    doc.fontSize(10).font("Helvetica-Bold");
    headers.forEach((header, i) => {
      doc.text(header, startX + i * columnWidth, startY, { width: columnWidth - 5 });
    });

    doc.moveTo(startX, startY + 15).lineTo(startX + headers.length * columnWidth, startY + 15).stroke();
    doc.moveDown();

    doc.font("Helvetica").fontSize(9);
    dispositivos.forEach(d => {
      const fechaEntrada = d.fecha_registro
        ? `${d.fecha_registro.toISOString().split("T")[0]} ${d.hora_registro || "00:00"}`
        : "N/A";
      const fechaSalida = d.fecha_salida
        ? `${d.fecha_salida.toISOString().split("T")[0]} ${d.hora_salida || "00:00"}`
        : "N/A";

      const y = doc.y;
      doc.text(String(d.id), startX, y, { width: columnWidth - 5 });
      doc.text(d.nombre, startX + columnWidth, y, { width: columnWidth - 5 });
      doc.text(d.estado, startX + columnWidth * 2, y, { width: columnWidth - 5 });
      doc.text(fechaEntrada, startX + columnWidth * 3, y, { width: columnWidth - 5 });
      doc.text(fechaSalida, startX + columnWidth * 4, y, { width: columnWidth - 5 });
      doc.moveDown();
    });

    doc.end();
    incrementarContador();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar PDF");
  }
};

const generarPdfUsuarios = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query = "SELECT * FROM usuarios WHERE 1=1";
    const params = [];
    if (desde) { query += " AND DATE(fecha_creacion) >= ?"; params.push(desde); }
    if (hasta) { query += " AND DATE(fecha_creacion) <= ?"; params.push(hasta); }

    const [usuarios] = await db.query(query, params);

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).send("No hay usuarios en la base de datos");
    }

    const doc = new PDFDocument();
    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora = ahora.toTimeString().slice(0, 5).replace(":", "-");
    const nombreArchivo = `reporte_usuarios_${fecha}_${hora}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${nombreArchivo}`);

    doc.pipe(res);

    doc.fontSize(18).font("Helvetica-Bold").text("Reporte de Usuarios", { align: "center" });
    doc.fontSize(10).text(`Generado: ${ahora.toLocaleString()}`, { align: "center" });
    doc.moveDown();

    const columnWidth = 120;
    const startX = 50;
    const startY = doc.y;
    const headers = ["ID", "Nombre", "Correo", "Rol"];

    doc.fontSize(10).font("Helvetica-Bold");
    headers.forEach((header, i) => {
      doc.text(header, startX + i * columnWidth, startY, { width: columnWidth - 5 });
    });

    doc.moveTo(startX, startY + 15).lineTo(startX + headers.length * columnWidth, startY + 15).stroke();
    doc.moveDown();

    doc.font("Helvetica").fontSize(9);
    usuarios.forEach(usuario => {
      const y = doc.y;
      doc.text(String(usuario.id), startX, y, { width: columnWidth - 5 });
      doc.text(usuario.nombre, startX + columnWidth, y, { width: columnWidth - 5 });
      doc.text(usuario.correo, startX + columnWidth * 2, y, { width: columnWidth - 5 });
      doc.text(usuario.rol, startX + columnWidth * 3, y, { width: columnWidth - 5 });
      doc.moveDown();
    });

    doc.end();
    incrementarContador();
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Error al generar PDF");
  }
};

module.exports = {
  generarExcelUsuarios,
  generarExcelDispositivos,
  generarPdfUsuarios,
  generarPdfDispositivos,
  previewUsuarios,
  previewDispositivos,
  obtenerContador,
};