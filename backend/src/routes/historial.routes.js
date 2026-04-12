const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historial.controller');

router.get('/:id', historialController.getByDispositivo);
router.post('/:id', historialController.create);

module.exports = router;
