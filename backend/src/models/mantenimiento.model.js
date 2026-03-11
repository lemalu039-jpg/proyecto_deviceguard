const pool = require('../database/connection');

class MantenimientoModel {
    static async findAll() {
        const query = `
            SELECT m.*, d.nombre as dispositivo_nombre, d.serial as dispositivo_serial
            FROM mantenimiento m
            JOIN dispositivos d ON m.dispositivo_id = d.id
            ORDER BY m.id DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `
            SELECT m.*, d.nombre as dispositivo_nombre, d.serial as dispositivo_serial
            FROM mantenimiento m
            JOIN dispositivos d ON m.dispositivo_id = d.id
            WHERE m.id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    static async create(data) {
        const { dispositivo_id, descripcion, costo, estado_mantenimiento } = data;
        const [result] = await pool.query(
            'INSERT INTO mantenimiento (dispositivo_id, descripcion, costo, estado_mantenimiento) VALUES (?, ?, ?, ?)',
            [dispositivo_id, descripcion, costo || 0, estado_mantenimiento || 'En Proceso']
        );

        // Actualizar dispositivo a 'En Mantenimiento'
        if ((estado_mantenimiento || 'En Proceso') === 'En Proceso') {
             await pool.query('UPDATE dispositivos SET estado = ? WHERE id = ?', ['En Mantenimiento', dispositivo_id]);
        }

        return result.insertId;
    }

    static async update(id, data) {
        const { descripcion, costo, estado_mantenimiento } = data;
        
        let query = 'UPDATE mantenimiento SET descripcion = ?, costo = ?, estado_mantenimiento = ?';
        const params = [descripcion, costo, estado_mantenimiento];

        if (estado_mantenimiento === 'Completado' || estado_mantenimiento === 'Cancelado') {
            query += ', fecha_fin = NOW()';
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await pool.query(query, params);

        // Si se completó el mantenimiento, cambiar estado del dispositivo a Disponible
        if (estado_mantenimiento === 'Completado') {
            const mtnto = await this.findById(id);
            if(mtnto) {
                await pool.query('UPDATE dispositivos SET estado = ? WHERE id = ?', ['Disponible', mtnto.dispositivo_id]);
            }
        }

        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM mantenimiento WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = MantenimientoModel;
