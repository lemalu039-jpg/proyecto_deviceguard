const DispositivoModel = require('../models/dispositivos.model');
const pool = require('../database/connection');
const upload = require("../middlewares/upload");
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
        let data = {...req.body , archivo: req.file ? req.file.filename : null};
        const insertId = await DispositivoModel.create(data);

        const destino = process.env.EMAIL_USER;
        console.log("=== CREATE dispositivo ===");
        console.log("destino email:", destino);

        if (destino) {
            console.log("Llamando enviarCorreo...");
            enviarCorreo({
                destinatario: destino,
                evento: EVENTOS.REGISTRO,
                datos: { nombre: data.nombre, serial: data.serial, marca: data.marca, tipo: data.tipo, ubicacion: data.ubicacion },
            }).catch(e => console.error("Error correo registro:", e.message));
        } else {
            console.log("EMAIL_USER vacío, no se envía correo");
        }

        res.status(201).json({ id: insertId, ...data });
    } catch (error) {
        console.error("Error al crear dispositivo:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    console.log("ENTRÉ AL UPDATE");
    console.log("EMAIL_USER disponible:", process.env.EMAIL_USER || "VACÍO");
    console.log("body.estado:", req.body.estado);
    try {
        // Validar transición de estado si se está cambiando el estado
        if (req.body.estado) {
            const dispositivo = await DispositivoModel.findById(req.params.id);
            if (!dispositivo) {
                return res.status(404).json({ error: 'Dispositivo no encontrado' });
            }

            const estadoActual = dispositivo.estado;
            const nuevoEstado = req.body.estado;

            const transicionesPermitidas = {
                "En Revision":       ["En Mantenimiento", "Entregado", "Listo para Entrega", "Listo para entrega"],
                "Listo para Entrega": ["Entregado"],
                "Listo para entrega": ["Entregado"],
            };

            const permitidos = transicionesPermitidas[estadoActual];
            if (permitidos && !permitidos.includes(nuevoEstado)) {
                // Ignore restriction for "Entregado" if it comes from the force action like registrar salida
                if (nuevoEstado !== "Entregado") {
                    return res.status(400).json({
                        error: `No se puede cambiar de "${estadoActual}" a "${nuevoEstado}". Transición no permitida.`
                    });
                }
            }
        }

        const affectedRows = await DispositivoModel.update(req.params.id, req.body);
        if (affectedRows > 0) {
            const nuevoEstado = req.body.estado;
            const destino = process.env.EMAIL_USER;

            if (destino && nuevoEstado) {
                const disp = await DispositivoModel.findById(req.params.id);
                let eventoCorreo = null;

                if (nuevoEstado === "En Mantenimiento") {
                    eventoCorreo = EVENTOS.INICIO_MANTENIMIENTO;
                } else if (nuevoEstado === "Listo para Entrega" || nuevoEstado === "Listo para entrega") {
                    eventoCorreo = EVENTOS.FIN_MANTENIMIENTO;
                } else if (nuevoEstado === "Entregado" || req.body.fecha_salida) {
                    eventoCorreo = EVENTOS.SALIDA;
                }

                if (eventoCorreo) {
                    enviarCorreo({
                        destinatario: destino,
                        evento: eventoCorreo,
                        datos: {
                            id: req.params.id,
                            nombre: disp?.nombre,
                            serial: disp?.serial,
                            fecha_salida: req.body.fecha_salida,
                            hora_salida: req.body.hora_salida,
                        },
                    }).catch(e => console.error("Error correo estado:", e.message));
                }
            }

            res.json({ message: 'Dispositivo actualizado exitosamente' });
        } else {
            res.status(404).json({ error: 'Dispositivo no encontrado' });
        }
    } catch (error) {
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
    const { serial } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM dispositivos WHERE serial = ?",
      [serial]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No encontrado" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error servidor" });
  }
};