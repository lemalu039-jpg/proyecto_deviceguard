const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

router.post('/login', usuariosController.login);
router.put('/cambiar-correo', usuariosController.cambiarCorreo);
router.put('/cambiar-contrasena', usuariosController.cambiarContrasena);
router.get('/', usuariosController.getAll);
router.get('/:id', usuariosController.getById);
router.post('/', usuariosController.create);
router.put('/:id', usuariosController.update);
router.delete('/:id', usuariosController.delete);
router.post('/registro', usuariosController.registro);


module.exports = router;
