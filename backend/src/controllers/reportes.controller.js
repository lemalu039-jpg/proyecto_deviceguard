const ExcelJS = require("exceljs");
const db = require("../database/connection");

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
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];

    const nombreArchivo = `reporte_dispositivos_${fecha}.xlsx`;

    res.setHeader(
    "Content-Disposition",
    `attachment; filename=${nombreArchivo}`
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

    // 📤 RESPUESTA
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];

    const nombreArchivo = `reporte_usuarios_${fecha}.xlsx`;

   res.setHeader(
  "Content-Disposition",
  `attachment; filename=${nombreArchivo}`
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
};