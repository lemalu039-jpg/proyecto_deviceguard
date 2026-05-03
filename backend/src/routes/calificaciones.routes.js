const express = require('express');
const router = express.Router();
const calificacionesController = require('../controllers/calificaciones.controller');

router.get('/serial/:serial', calificacionesController.buscarPorSerial);
router.post('/', calificacionesController.crear);
router.get('/', calificacionesController.getAll);
router.get('/tecnico/:tecnico_id', calificacionesController.getByTecnico);

module.exports = router;