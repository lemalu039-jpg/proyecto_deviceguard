const PrestamosModel = require('../models/prestamos.model');

exports.getAll = async (req, res) => {
    try {
        const prestamos = await PrestamosModel.findAll();
        res.json(prestamos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const prestamo = await PrestamosModel.findById(req.params.id);
        if (prestamo) {
            res.json(prestamo);
        } else {
            res.status(404).json({ error: 'Préstamo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const insertId = await PrestamosModel.create(req.body);
        res.status(201).json({ id: insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const affectedRows = await PrestamosModel.update(req.params.id, req.body);
        if (affectedRows > 0) {
            res.json({ message: 'Préstamo actualizado exitosamente' });
        } else {
            res.status(404).json({ error: 'Préstamo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const affectedRows = await PrestamosModel.delete(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Préstamo eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Préstamo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
