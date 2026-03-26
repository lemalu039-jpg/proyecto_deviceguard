const DispositivoModel = require('../models/dispositivos.model');
const pool = require('../database/connection'); // 👈 ARRIBA
const upload = require("../middlewares/upload");
const { enviarCorreo } = require("../services/email.service");
// const { uploadFile, uploadMultipleFiles } = require("../controllers/file.controller");

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
        // console.log("Archivo recibido:", req.file);
        let data = {...req.body , archivo: req.file ? req.file.filename : null};
        const insertId = await DispositivoModel.create(data);
        res.status(201).json({ id: insertId, ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    console.log("ENTRÉ AL UPDATE");
    try {
        const affectedRows = await DispositivoModel.update(req.params.id, req.body);
        if (affectedRows > 0) {
            await enviarCorreo({
  destinatario: process.env.EMAIL_USER, // por ahora a ti mismo
  asunto: "Salida de dispositivo",
  mensaje: `
El dispositivo con ID ${req.params.id} ha sido registrado como salida.

Fecha: ${req.body.fecha_salida}
Hora: ${req.body.hora_salida}
Estado: ${req.body.estado}
  `,
});

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