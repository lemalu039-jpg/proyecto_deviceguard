const express = require('express');
const router = express.Router();
const dispositivosController = require('../controllers/dispositivos.controller');
const upload = require("../middlewares/upload");

router.get('/', dispositivosController.getAll);
router.get('/:id', dispositivosController.getById);
router.post('/', upload.single('archivo'), dispositivosController.create);
router.put('/:id', dispositivosController.update);
router.delete('/:id', dispositivosController.delete);

module.exports = router;
