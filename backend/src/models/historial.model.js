const pool = require('../database/connection');

class HistorialModel {
    static async findByDispositivoId(id) {
        const [rows] = await pool.query(
            'SELECT * FROM historial_dispositivos WHERE id_dispositivo = ? ORDER BY fecha DESC',
            [id]
        );
        return rows;
    }

    static async create(data) {
        const { id_dispositivo, observacion, usuario_responsable } = data;
        const [result] = await pool.query(
            `INSERT INTO historial_dispositivos (id_dispositivo, observacion, usuario_responsable) 
             VALUES (?, ?, ?)`,
            [id_dispositivo, observacion, usuario_responsable]
        );
        return result.insertId;
    }
}

module.exports = HistorialModel;
