const HistorialModel = require('../models/historial.model');
const DispositivoModel = require('../models/dispositivos.model');

exports.getByDispositivo = async (req, res) => {
    try {
        const { id } = req.params;
        const historial = await HistorialModel.findByDispositivoId(id);
        const dispositivo = await DispositivoModel.findById(id);
        
        if (!dispositivo) {
            return res.status(404).json({ error: 'Dispositivo no encontrado' });
        }

        res.json({ dispositivo, historial });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { id } = req.params;
        const { observacion, usuario_responsable } = req.body;
        
        if (!observacion) {
            return res.status(400).json({ error: 'La observación es requerida' });
        }

        const insertId = await HistorialModel.create({
            id_dispositivo: id,
            observacion,
            usuario_responsable
        });

        res.status(201).json({ 
            id: insertId, 
            id_dispositivo: id, 
            observacion, 
            usuario_responsable,
            fecha: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
