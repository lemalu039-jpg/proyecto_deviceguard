const pool = require('../database/connection');

const estadoIdPorNombre = async (nombre) => {
  const [rows] = await pool.query('SELECT id FROM estados WHERE nombre = ? LIMIT 1', [nombre]);
  return rows[0]?.id || null;
};

class MantenimientoModel {

  static async findAll() {
    const [rows] = await pool.query(`
      SELECT m.*,
             d.nombre AS dispositivo_nombre,
             d.serial AS dispositivo_serial,
             e.nombre AS estado,
             u.nombre AS tecnico_nombre
      FROM mantenimiento m
      JOIN dispositivos d  ON m.dispositivo_id = d.id
      LEFT JOIN estados e  ON d.estado_id = e.id
      LEFT JOIN usuarios u ON m.tecnico_id = u.id
      ORDER BY m.id DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT m.*,
             d.nombre AS dispositivo_nombre,
             d.serial AS dispositivo_serial,
             e.nombre AS estado,
             u.nombre AS tecnico_nombre
      FROM mantenimiento m
      JOIN dispositivos d  ON m.dispositivo_id = d.id
      LEFT JOIN estados e  ON d.estado_id = e.id
      LEFT JOIN usuarios u ON m.tecnico_id = u.id
      WHERE m.id = ?
    `, [id]);
    return rows[0];
  }

  static async create(data) {
    const {
      dispositivo_id, descripcion, costo,
      estado_mantenimiento, tecnico_id,
      estado_pago, referencia_pago
    } = data;

    const [result] = await pool.query(
      `INSERT INTO mantenimiento
         (dispositivo_id, descripcion, costo, estado_mantenimiento, tecnico_id, estado_pago, referencia_pago)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dispositivo_id,
        descripcion,
        costo || 0,
        estado_mantenimiento || 'En Proceso',
        tecnico_id || null,
        estado_pago || null,
        referencia_pago || null
      ]
    );

    return result.insertId;
  }

  static async update(id, data) {
    const { descripcion, costo, estado_mantenimiento, tecnico_id, estado_pago, referencia_pago, transaccion_id, fecha_pago } = data;

    let query = 'UPDATE mantenimiento SET descripcion = ?, costo = ?, estado_mantenimiento = ?';
    const params = [descripcion, costo, estado_mantenimiento];

    if (tecnico_id !== undefined) {
      query += ', tecnico_id = ?';
      params.push(tecnico_id);
    }

    if (estado_pago !== undefined) {
      query += ', estado_pago = ?';
      params.push(estado_pago);
    }

    if (referencia_pago !== undefined) {
      query += ', referencia_pago = ?';
      params.push(referencia_pago);
    }

    if (transaccion_id !== undefined) {
      query += ', transaccion_id = ?';
      params.push(transaccion_id);
    }

    if (fecha_pago !== undefined) {
      query += ', fecha_pago = ?';
      params.push(fecha_pago);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);
    return result.affectedRows;
  }

  // Buscar el registro de mantenimiento activo de un dispositivo
  static async findActivoByDispositivo(dispositivo_id) {
    const [rows] = await pool.query(
      `SELECT m.*,
              d.nombre AS dispositivo_nombre,
              d.serial AS dispositivo_serial
       FROM mantenimiento m
       JOIN dispositivos d ON d.id = m.dispositivo_id
       WHERE m.dispositivo_id = ? AND m.estado_mantenimiento = 'En Proceso'
       ORDER BY m.id DESC LIMIT 1`,
      [dispositivo_id]
    );
    return rows[0] || null;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM mantenimiento WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = MantenimientoModel;
