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
    const { dispositivo_id, descripcion, costo, estado_mantenimiento, tecnico_id } = data;

    const [result] = await pool.query(
      `INSERT INTO mantenimiento (dispositivo_id, descripcion, costo, estado_mantenimiento, tecnico_id)
       VALUES (?, ?, ?, ?, ?)`,
      [dispositivo_id, descripcion, costo || 0, estado_mantenimiento || 'En Proceso', tecnico_id || null]
    );

    // Cambiar dispositivo a "En Mantenimiento" (id=2)
    const estado_id = await estadoIdPorNombre('En Mantenimiento') || 2;
    await pool.query('UPDATE dispositivos SET estado_id = ? WHERE id = ?', [estado_id, dispositivo_id]);

    return result.insertId;
  }

  static async update(id, data) {
    const { descripcion, costo, estado_mantenimiento, tecnico_id } = data;

    let query = 'UPDATE mantenimiento SET descripcion = ?, costo = ?, estado_mantenimiento = ?';
    const params = [descripcion, costo, estado_mantenimiento];

    if (tecnico_id !== undefined) {
      query += ', tecnico_id = ?';
      params.push(tecnico_id);
    }

    if (estado_mantenimiento === 'Completado' || estado_mantenimiento === 'Cancelado') {
      query += ', fecha_fin = NOW()';
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);

    // Si completó → dispositivo pasa a "Listo para Entrega" (id=3)
    if (estado_mantenimiento === 'Completado') {
      const mtnto = await this.findById(id);
      if (mtnto) {
        const estado_id = await estadoIdPorNombre('Listo para Entrega') || 3;
        await pool.query('UPDATE dispositivos SET estado_id = ? WHERE id = ?', [estado_id, mtnto.dispositivo_id]);
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
