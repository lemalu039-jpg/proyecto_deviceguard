const pool = require('../database/connection');

class DispositivoModel {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM dispositivos ORDER BY id DESC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM dispositivos WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { nombre, tipo, serial, marca, modelo, estado, ubicacion } = data;
        const [result] = await pool.query(
            'INSERT INTO dispositivos (nombre, tipo, serial, marca, modelo, estado, ubicacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, tipo, serial, marca, modelo, estado || 'Disponible', ubicacion]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { nombre, tipo, serial, marca, modelo, estado, ubicacion } = data;
        const [result] = await pool.query(
            'UPDATE dispositivos SET nombre = ?, tipo = ?, serial = ?, marca = ?, modelo = ?, estado = ?, ubicacion = ? WHERE id = ?',
            [nombre, tipo, serial, marca, modelo, estado, ubicacion, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM dispositivos WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = DispositivoModel;
