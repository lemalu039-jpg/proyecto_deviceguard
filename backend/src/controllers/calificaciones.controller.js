const pool = require('../database/connection');

// Buscar dispositivo por serial y verificar que está entregado
exports.buscarPorSerial = async (req, res) => {
  try {
    const { serial } = req.params;
    const [rows] = await pool.query(`
      SELECT d.id, d.nombre, d.serial, d.marca, d.tipo,
             COALESCE(e.nombre, 'Sin estado') AS estado,
             u.id AS tecnico_id, u.nombre AS tecnico_nombre
      FROM dispositivos d
      LEFT JOIN estados e ON d.estado_id = e.id
      LEFT JOIN usuarios u ON d.tecnico_id = u.id
      WHERE d.serial = ? AND d.activo = 1
    `, [serial]);

    if (!rows[0]) return res.status(404).json({ error: 'Dispositivo no encontrado' });
    if (rows[0].estado !== 'Entregado') return res.status(400).json({ error: 'El dispositivo aún no ha sido entregado' });

    // Verificar si ya fue calificado
    const [cal] = await pool.query('SELECT id FROM calificaciones WHERE dispositivo_id = ?', [rows[0].id]);
    if (cal.length > 0) return res.status(409).json({ error: 'Este dispositivo ya fue calificado' });

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Guardar calificación
exports.crear = async (req, res) => {
  try {
    const { dispositivo_id, tecnico_id, estrellas_empresa, estrellas_tecnico, comentario } = req.body;

    if (!dispositivo_id || !estrellas_empresa) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Verificar que el dispositivo esté entregado
    const [rows] = await pool.query(`
      SELECT d.id, COALESCE(e.nombre, '') AS estado, d.usuario_id
      FROM dispositivos d
      LEFT JOIN estados e ON d.estado_id = e.id
      WHERE d.id = ?
    `, [dispositivo_id]);

    if (!rows[0]) return res.status(404).json({ error: 'Dispositivo no encontrado' });
    if (rows[0].estado !== 'Entregado') return res.status(400).json({ error: 'El dispositivo aún no ha sido entregado' });

    // Verificar si ya fue calificado
    const [cal] = await pool.query('SELECT id FROM calificaciones WHERE dispositivo_id = ?', [dispositivo_id]);
    if (cal.length > 0) return res.status(409).json({ error: 'Este dispositivo ya fue calificado' });

    const [result] = await pool.query(
      `INSERT INTO calificaciones (dispositivo_id, tecnico_id, estrellas_empresa, estrellas_tecnico, comentario, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [dispositivo_id, tecnico_id || null, estrellas_empresa, estrellas_tecnico || null, comentario || null, rows[0].usuario_id || null]
    );

    res.status(201).json({ id: result.insertId, message: 'Calificación guardada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las calificaciones (para admin)
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, 
             d.nombre AS dispositivo_nombre, d.serial,
             u.nombre AS tecnico_nombre,
             us.nombre AS usuario_nombre
      FROM calificaciones c
      LEFT JOIN dispositivos d ON c.dispositivo_id = d.id
      LEFT JOIN usuarios u ON c.tecnico_id = u.id
      LEFT JOIN usuarios us ON c.usuario_id = us.id
      ORDER BY c.fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener calificaciones de un técnico específico
exports.getByTecnico = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, d.nombre AS dispositivo_nombre, d.serial
      FROM calificaciones c
      LEFT JOIN dispositivos d ON c.dispositivo_id = d.id
      WHERE c.tecnico_id = ?
      ORDER BY c.fecha DESC
    `, [req.params.tecnico_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};