const db = require('../database/connection');

const crearReporte = async (tipo, modulo, usuario_id) => {
  const [result] = await db.query(`
    INSERT INTO reportes (tipo, modulo, usuario_id)
    VALUES (?, ?, ?)
  `, [tipo, modulo, usuario_id]);

  return result;
};

const obtenerTotalReportes = async (usuario_id = null) => {
  if (usuario_id) {
    const [rows] = await db.query(
      `SELECT COUNT(*) as total FROM reportes WHERE usuario_id = ?`,
      [usuario_id]
    );
    return rows[0];
  }
  const [rows] = await db.query(`SELECT COUNT(*) as total FROM reportes`);
  return rows[0];
};

module.exports = {
  crearReporte,
  obtenerTotalReportes
};