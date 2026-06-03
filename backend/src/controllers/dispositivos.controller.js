const DispositivoModel = require('../models/dispositivos.model');
const pool = require('../database/connection');
const { enviarCorreo, EVENTOS } = require("../services/email.service");
const ExcelJS = require('exceljs');
const fs = require('fs');

exports.getAll = async (req, res) => {
    try {
        const dispositivos = await DispositivoModel.findAll();
        res.json(dispositivos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const dispositivo = await DispositivoModel.findById(req.params.id);
        if (dispositivo) {
            res.json(dispositivo);
        } else {
            res.status(404).json({ error: 'Dispositivo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const usuario_id = req.headers['x-usuario-id'] ? parseInt(req.headers['x-usuario-id']) : (req.body.usuario_id || null);
        const upload = require("../middlewares/upload");
        let data = { ...req.body, archivo: req.file ? req.file.filename : null, usuario_id };

        const insertId = await DispositivoModel.create(data);

        // Obtener correo del usuario para notificación
        if (usuario_id) {
            try {
                const [[usuario]] = await pool.query("SELECT correo FROM usuarios WHERE id = ? LIMIT 1", [usuario_id]);
                const destino = usuario?.correo || process.env.EMAIL_USER;
                enviarCorreo({
                    destinatario: destino,
                    usuario_id,
                    evento: EVENTOS.REGISTRO,
                    datos: { nombre: data.nombre, serial: data.serial, marca: data.marca, tipo: data.tipo, ubicacion: data.ubicacion },
                }).catch(e => console.error("Error correo registro:", e.message));
            } catch (e) {
                console.error("Error obteniendo correo usuario:", e.message);
            }
        }

        res.status(201).json({ id: insertId, ...data });
    } catch (error) {
        console.error("Error al crear dispositivo:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    console.log("ENTRÉ AL UPDATE - estado:", req.body.estado);
    try {
        if (req.body.estado) {
            const dispositivo = await DispositivoModel.findById(req.params.id);
            if (!dispositivo) {
                return res.status(404).json({ error: 'Dispositivo no encontrado' });
            }

            const estadoActual = dispositivo.estado;
            const nuevoEstado = req.body.estado;

            if (nuevoEstado !== 'Entregado') {
                const transicionesPermitidas = {
                    "En Revision":        ["En Mantenimiento"],
                    "En Mantenimiento":   ["Listo para Entrega", "Listo para entrega"],
                    "Listo para Entrega": ["Entregado"],
                    "Listo para entrega": ["Entregado"],
                    "Disponible":         ["En Revision", "Entregado"],
                    "Dado de Baja":       ["Entregado"],
                };

                const permitidos = transicionesPermitidas[estadoActual];
                if (permitidos && !permitidos.includes(nuevoEstado)) {
                    return res.status(400).json({
                        error: `No se puede cambiar de "${estadoActual}" a "${nuevoEstado}". Transición no permitida.`
                    });
                }
            }

            const tecnico_id = req.headers['x-usuario-id'] ? parseInt(req.headers['x-usuario-id']) : null;

            if (nuevoEstado === "En Mantenimiento") {
                const costoInicial = parseFloat(req.body.costo_mantenimiento) || 0;
                const [mntResult] = await pool.query(
                    `INSERT INTO mantenimiento
                       (dispositivo_id, descripcion, estado_mantenimiento, tecnico_id, fecha, costo, estado_pago, referencia_pago)
                     VALUES (?, 'Inicio de mantenimiento', 'En Proceso', ?, NOW(), ?, 'Pendiente', ?)`,
                    [req.params.id, tecnico_id, costoInicial, `MANT-${req.params.id}`]
                );
                // Limpiar fecha_salida al entrar a mantenimiento
                await pool.query(
                    `UPDATE dispositivos SET fecha_salida = NULL, hora_salida = NULL WHERE id = ?`,
                    [req.params.id]
                );
            }

            if (nuevoEstado === "Listo para Entrega" || nuevoEstado === "Listo para entrega") {
                await pool.query(
                    `INSERT INTO mantenimiento (dispositivo_id, descripcion, estado_mantenimiento, tecnico_id, fecha)
                     VALUES (?, 'Mantenimiento completado - listo para entrega', 'Completado', ?, NOW())`,
                    [req.params.id, tecnico_id]
                );
            }

            if (nuevoEstado === "Entregado") {
                await pool.query(
                    `INSERT INTO mantenimiento (dispositivo_id, descripcion, estado_mantenimiento, tecnico_id, fecha)
                     VALUES (?, 'Dispositivo entregado al cliente', 'Completado', ?, NOW())`,
                    [req.params.id, tecnico_id]
                );
            }
        }

        const affectedRows = await DispositivoModel.update(req.params.id, req.body);
        if (affectedRows > 0) {
            const nuevoEstado = req.body.estado;

            if (nuevoEstado || req.body.fecha_salida) {
                const disp = await DispositivoModel.findById(req.params.id);
                let eventoCorreo = null;

                if (nuevoEstado === "En Mantenimiento")                                    eventoCorreo = EVENTOS.INICIO_MANTENIMIENTO;
                else if (nuevoEstado === "Listo para Entrega" || nuevoEstado === "Listo para entrega") eventoCorreo = EVENTOS.FIN_MANTENIMIENTO;
                else if (nuevoEstado === "Entregado" || (req.body.fecha_salida && req.body.fecha_salida !== 'null')) eventoCorreo = EVENTOS.SALIDA;

                if (eventoCorreo && disp) {
                    // Obtener correo del usuario dueño del dispositivo
                    let destino = process.env.EMAIL_USER;
                    let uid = disp.usuario_id || null;
                    if (uid) {
                        try {
                            const [[usuario]] = await pool.query("SELECT correo FROM usuarios WHERE id = ? LIMIT 1", [uid]);
                            if (usuario?.correo) destino = usuario.correo;
                        } catch (e) {
                            console.error("Error obteniendo correo usuario:", e.message);
                        }
                    }

                    enviarCorreo({
                        destinatario: destino,
                        usuario_id: uid,
                        evento: eventoCorreo,
                        datos: {
                            id: req.params.id,
                            nombre: disp.nombre,
                            serial: disp.serial,
                            fecha_salida: req.body.fecha_salida,
                            hora_salida:  req.body.hora_salida,
                        },
                    }).catch(e => console.error("Error correo estado:", e.message));
                }
            }

            res.json({ message: 'Dispositivo actualizado exitosamente' });
        } else {
            res.status(404).json({ error: 'Dispositivo no encontrado' });
        }
    } catch (error) {
        console.error("Error en update dispositivo:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const affectedRows = await DispositivoModel.delete(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Dispositivo eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Dispositivo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBySerial = async (req, res) => {
    try {
        const dispositivo = await DispositivoModel.findBySerial(req.params.serial);
        if (!dispositivo) {
            return res.status(404).json({ message: "No encontrado" });
        }
        res.json(dispositivo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error servidor" });
    }
};

exports.getAsignados = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.id, d.nombre, d.serial, d.marca, d.tipo,
                   d.ubicacion, d.descripcion, d.archivo,
                   d.hora_registro, d.fecha_registro,
                   d.usuario_id, d.tecnico_id,
                   COALESCE(e.nombre, 'Sin estado') AS estado,
                   u.nombre AS registrado_por
            FROM dispositivos d
            LEFT JOIN estados e ON d.estado_id = e.id
            LEFT JOIN usuarios u ON d.usuario_id = u.id
            WHERE d.tecnico_id = ? AND d.activo = 1
            ORDER BY d.id DESC
        `, [req.params.tecnico_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPapelera = async (req, res) => {
    try {
        const dispositivos = await DispositivoModel.findAllDeleted();
        res.json(dispositivos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.restore = async (req, res) => {
    try {
        const affectedRows = await DispositivoModel.restore(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Dispositivo restaurado exitosamente' });
        } else {
            res.status(404).json({ error: 'Dispositivo no encontrado en la papelera' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.permanentDelete = async (req, res) => {
    try {
        const affectedRows = await DispositivoModel.permanentDelete(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Dispositivo eliminado permanentemente' });
        } else {
            res.status(404).json({ error: 'Dispositivo no encontrado en la papelera' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.descargarPlantillaImport = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Plantilla");

        worksheet.columns = [
            { header: "nombre", key: "nombre", width: 25 },
            { header: "tipo", key: "tipo", width: 20 },
            { header: "serial", key: "serial", width: 20 },
            { header: "marca", key: "marca", width: 15 },
            { header: "ubicacion", key: "ubicacion", width: 20 },
            { header: "descripcion", key: "descripcion", width: 40 }
        ];

        worksheet.getRow(1).font = { bold: true };

        worksheet.addRow({
            nombre: "Portátil HP",
            tipo: "Portátil",
            serial: "ABC-123456",
            marca: "HP",
            ubicacion: "Aula 101",
            descripcion: "Pantalla 15.6\""
        });

        const nombreArchivo = `plantilla_dispositivos_${new Date().getTime()}.xlsx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${nombreArchivo}`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error al descargar plantilla:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.importarDispositivos = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No se subió ningún archivo" });
        }

        const filePath = req.file.path;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, error: "El archivo no contiene hojas de cálculo" });
        }

        // Validar headers
        const expectedHeaders = ["nombre", "tipo", "serial", "marca", "ubicacion", "descripcion"];
        const headerRow = worksheet.getRow(1);
        const actualHeaders = headerRow.values.slice(1).map(h => h?.toLowerCase?.() || "");

        const headersMismatch = !expectedHeaders.every((h, i) => actualHeaders[i] === h);
        if (headersMismatch) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                error: "Formato de archivo inválido",
                details: `Se esperan columnas: ${expectedHeaders.join(", ")}`
            });
        }

        const summary = {
            total: 0,
            imported: 0,
            skipped: 0,
            errors: []
        };

        const seriaiesProcessados = new Set();

        // Procesar filas
        for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
            const row = worksheet.getRow(rowNum);
            const values = row.values.slice(1);

            // Saltar filas completamente vacías
            if (!values.some(v => v && String(v).trim())) {
                continue;
            }

            summary.total++;

            const nombre = values[0] ? String(values[0]).trim() : "";
            const tipo = values[1] ? String(values[1]).trim() : "";
            const serial = values[2] ? String(values[2]).trim() : "";
            const marca = values[3] ? String(values[3]).trim() : "";
            const ubicacion = values[4] ? String(values[4]).trim() : "";
            const descripcion = values[5] ? String(values[5]).trim() : "";

            // Validar campos requeridos
            if (!nombre) {
                summary.skipped++;
                summary.errors.push({ row: rowNum, serial: serial || "N/A", reason: "Campo nombre requerido" });
                continue;
            }

            if (!tipo) {
                summary.skipped++;
                summary.errors.push({ row: rowNum, serial: serial || "N/A", reason: "Campo tipo requerido" });
                continue;
            }

            if (!serial) {
                summary.skipped++;
                summary.errors.push({ row: rowNum, serial: "N/A", reason: "Campo serial requerido" });
                continue;
            }

            if (!marca) {
                summary.skipped++;
                summary.errors.push({ row: rowNum, serial, reason: "Campo marca requerido" });
                continue;
            }

            // Validar formato serial (alphanumeric + hyphens)
            if (!/^[a-zA-Z0-9-]{1,50}$/.test(serial)) {
                summary.skipped++;
                summary.errors.push({ row: rowNum, serial, reason: "Formato inválido de serial" });
                continue;
            }

            // Chequear duplicado en batch
            if (seriaiesProcessados.has(serial)) {
                summary.skipped++;
                summary.errors.push({ row: rowNum, serial, reason: "Serial duplicado en el archivo" });
                continue;
            }

            // Chequear duplicado en BD
            const existente = await DispositivoModel.findBySerial(serial);
            if (existente) {
                summary.skipped++;
                summary.errors.push({ row: rowNum, serial, reason: "Serial duplicado en base de datos" });
                continue;
            }

            try {
                const data = {
                    nombre,
                    tipo,
                    serial,
                    marca,
                    ubicacion: ubicacion || null,
                    descripcion: descripcion || null,
                    usuario_id: req.headers['x-usuario-id'] ? parseInt(req.headers['x-usuario-id']) : null
                };

                await DispositivoModel.create(data);
                seriaiesProcessados.add(serial);
                summary.imported++;
            } catch (err) {
                summary.skipped++;
                summary.errors.push({ row: rowNum, serial, reason: `Error al insertar: ${err.message}` });
            }
        }

        // Limpiar archivo temporal
        fs.unlinkSync(filePath);

        if (summary.total === 0) {
            return res.status(400).json({
                success: false,
                error: "El archivo no contiene datos para importar"
            });
        }

        res.status(201).json({
            success: true,
            summary,
            message: `${summary.imported} dispositivos importados exitosamente`
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error al importar dispositivos:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};