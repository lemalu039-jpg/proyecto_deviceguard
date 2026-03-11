const MantenimientoModel = require('../models/mantenimiento.model');

exports.getAll = async (req, res) => {
    try {
        const mantenimiento = await MantenimientoModel.findAll();
        res.json(mantenimiento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const mtnto = await MantenimientoModel.findById(req.params.id);
        if (mtnto) {
            res.json(mtnto);
        } else {
            res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const insertId = await MantenimientoModel.create(req.body);
        res.status(201).json({ id: insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const affectedRows = await MantenimientoModel.update(req.params.id, req.body);
        if (affectedRows > 0) {
            res.json({ message: 'Mantenimiento actualizado exitosamente' });
        } else {
            res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const affectedRows = await MantenimientoModel.delete(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Mantenimiento eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
