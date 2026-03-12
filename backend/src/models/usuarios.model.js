const pool = require('../database/connection');

class UsuarioModel {
    static async findAll() {
        const [rows] = await pool.query('SELECT id, nombre, correo, rol, fecha_creacion FROM usuarios');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT id, nombre, correo, rol, fecha_creacion FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { nombre, correo, contrasena, rol } = data;
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
            [nombre, correo, contrasena, rol || 'usuario']
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { nombre, correo, rol } = data;
        const [result] = await pool.query(
            'UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?',
            [nombre, correo, rol, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async findByEmail(correo) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        return rows[0];
    }
    
    static async cambiarCorreo(id, correo) {
    const [result] = await pool.query(
        'UPDATE usuarios SET correo = ? WHERE id = ?',
        [correo, id]
    );

    return result.affectedRows;
}
}

module.exports = UsuarioModel;
