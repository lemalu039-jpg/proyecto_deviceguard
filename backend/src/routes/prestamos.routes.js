const express = require('express');
const router = express.Router();
const prestamosController = require('../controllers/prestamos.controller');

router.get('/', prestamosController.getAll);
router.get('/:id', prestamosController.getById);
router.post('/', prestamosController.create);
router.put('/:id', prestamosController.update);
router.delete('/:id', prestamosController.delete);

module.exports = router;
