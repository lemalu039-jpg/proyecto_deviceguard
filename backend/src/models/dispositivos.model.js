const pool = require('../database/connection');

const estadoIdPorNombre = async (nombre) => {
  const [rows] = await pool.query('SELECT id FROM estados WHERE nombre = ? LIMIT 1', [nombre]);
  return rows[0]?.id || null;
};

class DispositivoModel {

  static async findAll() {
    const [rows] = await pool.query(`
      SELECT d.*, COALESCE(e.nombre, 'Sin estado') AS estado
      FROM dispositivos d
      LEFT JOIN estados e ON d.estado_id = e.id
      ORDER BY d.id DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT d.*, COALESCE(e.nombre, 'Sin estado') AS estado
      FROM dispositivos d
      LEFT JOIN estados e ON d.estado_id = e.id
      WHERE d.id = ?
    `, [id]);
    return rows[0];
  }

  static async create(data) {
    const {
      nombre, tipo, serial, marca, ubicacion,
      fecha_registro, hora_registro, archivo, descripcion, usuario_id
    } = data;

    // Estado inicial siempre "En Revision" = id 1
    const estado_id = await estadoIdPorNombre('En Revision') || 1;

    const [result] = await pool.query(
      `INSERT INTO dispositivos
        (nombre, tipo, serial, marca, ubicacion, estado_id, fecha_registro, hora_registro, archivo, descripcion, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, tipo, serial, marca, ubicacion, estado_id,
       fecha_registro, hora_registro, archivo || null, descripcion || null, usuario_id || null]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    // Campos que NO se mapean directamente (se manejan aparte)
    const excluir = new Set(['estado', 'estado_id']);

    // Si viene "estado" como texto, convertir a estado_id
    if (data.estado) {
      const estado_id = await estadoIdPorNombre(data.estado);
      if (estado_id) {
        fields.push('estado_id = ?');
        values.push(estado_id);
      }
    }

    // Si viene estado_id directo
    if (data.estado_id) {
      fields.push('estado_id = ?');
      values.push(data.estado_id);
      excluir.add('estado_id'); // ya lo agregamos
    }

    for (const key of Object.keys(data)) {
      if (!excluir.has(key) && data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE dispositivos SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM dispositivos WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async findBySerial(serial) {
    const [rows] = await pool.query(`
      SELECT d.*, COALESCE(e.nombre, 'Sin estado') AS estado
      FROM dispositivos d
      LEFT JOIN estados e ON d.estado_id = e.id
      WHERE d.serial = ?
    `, [serial]);
    return rows[0];
  }
}

module.exports = DispositivoModel;
