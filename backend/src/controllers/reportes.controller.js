const ExcelJS = require("exceljs");
const db = require("../database/connection");

const generarExcelDispositivos = async (req, res) => {
  try {
    const [dispositivos] = await db.query("SELECT * FROM dispositivos");

    if (!dispositivos || dispositivos.length === 0) {
      return res.status(404).send("No hay dispositivos en la base de datos");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Dispositivos");

    // 🧠 TITULO
    worksheet.addRow(["DEVICEGUARD"]);
    worksheet.addRow(["Reporte de Dispositivos"]);
    worksheet.addRow([`Fecha: ${new Date().toLocaleDateString()}`]);
    worksheet.addRow([]);

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

    worksheet.getRow(5).font = { bold: true };

    // 📤 RESPUESTA
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dispositivos.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar Excel");
  }
};

const generarExcelBD = async (req, res) => {
  try {
    const [usuarios] = await db.query("SELECT COUNT(*) as total FROM usuarios");
    const [dispositivos] = await db.query("SELECT COUNT(*) as total FROM dispositivos");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Resumen");

    // 🧠 TITULO
    worksheet.addRow(["DEVICEGUARD"]);
    worksheet.addRow(["Reporte General del Sistema"]);
    worksheet.addRow([`Fecha: ${new Date().toLocaleDateString()}`]);
    worksheet.addRow([]);

    // 📊 COLUMNAS
    worksheet.columns = [
      { header: "Descripción", key: "descripcion", width: 30 },
      { header: "Cantidad", key: "cantidad", width: 15 }
    ];

    // 📥 DATOS
    worksheet.addRow({
      descripcion: "Total de usuarios",
      cantidad: usuarios[0].total
    });

    worksheet.addRow({
      descripcion: "Total de dispositivos",
      cantidad: dispositivos[0].total
    });

    worksheet.getRow(5).font = { bold: true };

    // 📤 RESPUESTA
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bd.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar Excel");
  }
};

const generarExcelUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.query("SELECT * FROM usuarios");

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).send("No hay usuarios en la base de datos");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Usuarios");

    // 🧠 TÍTULO
    worksheet.addRow(["DEVICEGUARD"]);
    worksheet.addRow(["Reporte de Usuarios"]);
    worksheet.addRow([`Fecha: ${new Date().toLocaleDateString()}`]);
    worksheet.addRow([]); // espacio

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
    worksheet.getRow(5).font = { bold: true };

    // 📤 RESPUESTA
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=usuarios.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Error al generar Excel");
  }
};

module.exports = {
  generarExcelUsuarios,
  generarExcelDispositivos,
  generarExcelBD
};