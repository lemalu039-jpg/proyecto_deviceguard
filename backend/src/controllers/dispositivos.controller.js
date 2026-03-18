const DispositivoModel = require('../models/dispositivos.model');

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
        console.log("data WILMAR", req.files)
        return
        res.status(201).json({id: 1000, name: "Test Wilmar" })
        const insertId = await DispositivoModel.create(req.body);
        res.status(201).json({ id: insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const affectedRows = await DispositivoModel.update(req.params.id, req.body);
        if (affectedRows > 0) {
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