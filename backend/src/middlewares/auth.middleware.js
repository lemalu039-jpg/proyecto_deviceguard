/**
 * Middleware de validación de rol.
 * El frontend debe enviar el usuario logueado en el header:
 *   x-usuario-id: <id>
 * El middleware busca el usuario en BD y verifica su rol.
 */
const pool = require('../database/connection');

const verificarRol = (...rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      const usuarioId = req.headers['x-usuario-id'];
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado. Falta x-usuario-id en headers.' });
      }

      const [rows] = await pool.query('SELECT id, rol FROM usuarios WHERE id = ?', [usuarioId]);
      const usuario = rows[0];

      if (!usuario) {
        return res.status(401).json({ error: 'Usuario no encontrado.' });
      }

      if (!rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({
          error: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}. Tu rol es: ${usuario.rol}`
        });
      }

      req.usuarioActual = usuario;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = { verificarRol };
