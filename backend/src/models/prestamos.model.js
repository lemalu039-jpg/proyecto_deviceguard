const pool = require('../database/connection');

class PrestamosModel {
    static async findAll() {
        const query = `
            SELECT p.*, 
                   u.nombre as usuario_nombre, u.correo as usuario_correo,
                   d.nombre as dispositivo_nombre, d.serial as dispositivo_serial
            FROM prestamos p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN dispositivos d ON p.dispositivo_id = d.id
            ORDER BY p.id DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `
            SELECT p.*, 
                   u.nombre as usuario_nombre, u.correo as usuario_correo,
                   d.nombre as dispositivo_nombre, d.serial as dispositivo_serial
            FROM prestamos p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN dispositivos d ON p.dispositivo_id = d.id
            WHERE p.id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    static async create(data) {
        const { usuario_id, dispositivo_id } = data;
        // The prestamo date is automatic
        const [result] = await pool.query(
            'INSERT INTO prestamos (usuario_id, dispositivo_id, estado_prestamo) VALUES (?, ?, ?)',
            [usuario_id, dispositivo_id, 'Activo']
        );

        // Update device status to 'En Prestamo'
        await pool.query('UPDATE dispositivos SET estado = ? WHERE id = ?', ['En Prestamo', dispositivo_id]);

        return result.insertId;
    }

    static async update(id, data) {
        const { estado_prestamo } = data;
        
        let query = 'UPDATE prestamos SET estado_prestamo = ?';
        const params = [estado_prestamo];

        if (estado_prestamo === 'Devuelto') {
            query += ', fecha_devolucion = NOW()';
        }
        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await pool.query(query, params);

        // If returned, update the device as Available
        if (estado_prestamo === 'Devuelto') {
            const prestamo = await this.findById(id);
            if (prestamo) {
                await pool.query('UPDATE dispositivos SET estado = ? WHERE id = ?', ['Disponible', prestamo.dispositivo_id]);
            }
        }

        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM prestamos WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = PrestamosModel;
