const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verificarRol } = require('../middlewares/auth.middleware');

router.post('/login', usuariosController.login);
router.post('/registro', usuariosController.registro);
router.put('/cambiar-correo', usuariosController.cambiarCorreo);
router.put('/cambiar-contrasena', usuariosController.cambiarContrasena);
router.post('/recuperar', usuariosController.solicitarRecuperacion);
router.post('/restablecer', usuariosController.restablecerContrasena);
router.get('/', usuariosController.getAll);
router.get('/:id', usuariosController.getById);
// Solo super_admin puede crear, editar o eliminar usuarios
router.post('/', verificarRol('super_admin'), usuariosController.create);
router.put('/:id', verificarRol('super_admin'), usuariosController.update);
router.delete('/:id', verificarRol('super_admin'), usuariosController.delete);

module.exports = router;
