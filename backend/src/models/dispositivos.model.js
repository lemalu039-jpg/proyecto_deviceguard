const pool = require('../database/connection');

class DispositivoModel {

    static async findAll() {
        const [rows] = await pool.query(
            'SELECT * FROM dispositivos ORDER BY id DESC'
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM dispositivos WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { 
            nombre, 
            tipo, 
            serial, 
            marca, 
            estado, 
            ubicacion, 
            fecha_registro, 
            hora_registro,
            archivo
        } = data;

        const [result] = await pool.query(
            `INSERT INTO dispositivos 
            (nombre, tipo, serial, marca, estado, ubicacion, fecha_registro, hora_registro, archivo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre, 
                tipo, 
                serial, 
                marca, 
                estado || "En revision",
                ubicacion, 
                fecha_registro, 
                hora_registro,
                archivo || null
            ]
        );

        return result.insertId;
    }

static async update(id, data) {
    const fields = [];
    const values = [];

    for (const key in data) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    if (fields.length === 0) return 0;

    const query = `
        UPDATE dispositivos 
        SET ${fields.join(', ')}
        WHERE id = ?
    `;

    values.push(id);

    const [result] = await pool.query(query, values);

    return result.affectedRows;
}

    static async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM dispositivos WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    static async findBySerial(serial) {
        const [rows] = await pool.query(
            'SELECT * FROM dispositivos WHERE serial = ?',
            [serial]
        );
        return rows[0];
    }
}

module.exports = DispositivoModel;