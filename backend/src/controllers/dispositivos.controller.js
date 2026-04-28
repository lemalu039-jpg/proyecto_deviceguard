const DispositivoModel = require('../models/dispositivos.model');
const pool = require('../database/connection');
const { enviarCorreo, EVENTOS } = require("../services/email.service");

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
        const usuario_id = req.headers['x-usuario-id'] || req.body.usuario_id || null;
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

            const tecnico_id = req.headers['x-usuario-id'] || null;

            if (nuevoEstado === "En Mantenimiento") {
                await pool.query(
                    `INSERT INTO mantenimiento (dispositivo_id, descripcion, estado_mantenimiento, tecnico_id, fecha)
                     VALUES (?, 'Inicio de mantenimiento', 'En Proceso', ?, NOW())`,
                    [req.params.id, tecnico_id]
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
