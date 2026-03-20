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
        const { nombre, tipo, serial, marca, estado, ubicacion, fecha_registro, hora_registro } = data;
        const [result] = await pool.query(
            'INSERT INTO dispositivos (nombre, tipo, serial, marca, estado, ubicacion, fecha_registro, hora_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, tipo, serial, marca, estado || 'Disponible', ubicacion, fecha_registro, hora_registro]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { nombre, tipo, serial, marca, estado, ubicacion, fecha_registro, hora_registro } = data;
        const [result] = await pool.query(
            'UPDATE dispositivos SET nombre = ?, tipo = ?, serial = ?, marca = ?, estado = ?, ubicacion = ?, fecha_registro = ?, hora_registro = ? WHERE id = ?',
            [nombre, tipo, serial, marca, estado, ubicacion, fecha_registro, hora_registro, id]
        );
        return result.affectedRows;
    }
    const { nombre, tipo, serial, marca, estado, ubicacion, archivo } = data;
    const [result] = await pool.query(
        'INSERT INTO dispositivos (nombre, tipo, serial, marca, estado, ubicacion, archivo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre, tipo, serial, marca, estado || 'Disponible', ubicacion, archivo || null]
    );
    return result.insertId;
}

static async update(id, data) {
    const { nombre, tipo, serial, marca, estado, ubicacion, archivo } = data;
    const [result] = await pool.query(
        'UPDATE dispositivos SET nombre = ?, tipo = ?, serial = ?, marca = ?, estado = ?, ubicacion = ?, archivo = ? WHERE id = ?',
        [nombre, tipo, serial, marca, estado, ubicacion, archivo || null, id]
    );
    return result.affectedRows;
}
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM dispositivos WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Buscar dispositivo por serial
static async findBySerial(serial) {
  const [rows] = await pool.query(
    'SELECT * FROM dispositivos WHERE serial = ?',
    [serial]
  );
  return rows[0];
}
}

module.exports = DispositivoModel;
