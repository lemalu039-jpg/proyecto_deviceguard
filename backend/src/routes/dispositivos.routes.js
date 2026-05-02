const express = require('express');
const router = express.Router();
const dispositivosController = require('../controllers/dispositivos.controller');
const upload = require("../middlewares/upload");
const { verificarRol } = require('../middlewares/auth.middleware');

// Rutas estáticas primero (antes de /:id para evitar conflictos)
router.get('/serial/:serial', dispositivosController.getBySerial);
router.get('/papelera/todos', verificarRol('super_admin', 'admin', 'tecnico'), dispositivosController.getPapelera);
router.get('/asignados/:tecnico_id', dispositivosController.getAsignados);
router.get('/', dispositivosController.getAll);

// Rutas con parámetro dinámico al final
router.get('/:id', dispositivosController.getById);

router.post('/', verificarRol('usuario', 'super_admin'), upload.single('archivo'), dispositivosController.create);

router.put('/:id/restaurar', verificarRol('super_admin', 'admin'), dispositivosController.restore);
router.put('/:id', dispositivosController.update);

router.delete('/:id/permanente', verificarRol('super_admin'), dispositivosController.permanentDelete);
router.delete('/:id', verificarRol('super_admin', 'admin'), dispositivosController.delete);

module.exports = router;