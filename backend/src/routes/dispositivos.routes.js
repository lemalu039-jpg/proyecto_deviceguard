const express = require('express');
const router = express.Router();
const dispositivosController = require('../controllers/dispositivos.controller');
const upload = require("../middlewares/upload");
const { verificarRol } = require('../middlewares/auth.middleware');

router.get('/serial/:serial', dispositivosController.getBySerial);
router.get('/', dispositivosController.getAll);
router.get('/:id', dispositivosController.getById);
// Solo usuario puede registrar dispositivos
router.post('/', verificarRol('usuario', 'super_admin'), upload.single('archivo'), dispositivosController.create);
router.put('/:id', dispositivosController.update);
router.delete('/:id', verificarRol('super_admin'), dispositivosController.delete);

module.exports = router;