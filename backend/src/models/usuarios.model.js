const pool = require('../database/connection');

class UsuarioModel {
    static async findAll() {
        const [rows] = await pool.query('SELECT id, nombre, correo, rol, fecha_creacion, activo FROM usuarios');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT id, nombre, correo, rol, fecha_creacion, activo FROM usuarios WHERE id = ?', [id]);
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
        // Borrado lógico en lugar de físico
        const [result] = await pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async toggleStatus(id, activo) {
        const [result] = await pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [activo, id]);
        return result.affectedRows;
    }

    static async findByEmail(correo) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ? AND activo = 1', [correo]);
        return rows[0];
    }
    
    static async guardarTokenRecuperacion(id, token, expires) {
        const [result] = await pool.query(
            'UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [token, expires, id]
        );
        return result.affectedRows;
    }

    static async findByResetToken(token) {
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW()',
            [token]
        );
        return rows[0];
    }

    static async borrarTokenRecuperacion(id) {
        const [result] = await pool.query(
            'UPDATE usuarios SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }
    
    static async cambiarCorreo(id, correo) {
    const [result] = await pool.query(
        'UPDATE usuarios SET correo = ? WHERE id = ?',
        [correo, id]
    );

    return result.affectedRows;
}
static async cambiarContrasena(id, contrasena) {
    const [result] = await pool.query(
        'UPDATE usuarios SET contrasena = ? WHERE id = ?',
        [contrasena, id]
    );

    return result.affectedRows;
}
}

module.exports = UsuarioModel;
