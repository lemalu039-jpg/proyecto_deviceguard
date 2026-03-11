const express = require('express');
const router = express.Router();
const mantenimientoController = require('../controllers/mantenimiento.controller');

router.get('/', mantenimientoController.getAll);
router.get('/:id', mantenimientoController.getById);
router.post('/', mantenimientoController.create);
router.put('/:id', mantenimientoController.update);
router.delete('/:id', mantenimientoController.delete);

module.exports = router;
