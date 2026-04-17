const express = require('express');
const router = express.Router();
const mantenimientoController = require('../controllers/mantenimiento.controller');
const { verificarRol } = require('../middlewares/auth.middleware');

router.get('/', mantenimientoController.getAll);
router.get('/:id', mantenimientoController.getById);
// Solo técnico puede crear mantenimiento
router.post('/', verificarRol('tecnico', 'super_admin'), mantenimientoController.create);
router.put('/:id', verificarRol('tecnico', 'super_admin'), mantenimientoController.update);
router.delete('/:id', verificarRol('super_admin'), mantenimientoController.delete);

module.exports = router;
