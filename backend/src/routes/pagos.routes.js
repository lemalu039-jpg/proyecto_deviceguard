// src/routes/pagos.routes.js

const express    = require('express');
const router     = express.Router();
const pagosCtrl  = require('../controllers/pagos.controller');
const { verificarRol } = require('../middlewares/auth.middleware');

// ── Webhook: ruta pública — Wompi la llama directamente, sin header x-usuario-id
router.post('/webhook', pagosCtrl.webhookWompi);

// ── Datos del pago: solo el usuario dueño del dispositivo necesita verlos
//    Abierto a todos los roles autenticados (el controller valida que sea su dispositivo)
router.get('/datos/:dispositivoId', pagosCtrl.getDatosPago);

// ── Confirmar pago: solo rol usuario puede confirmar desde su vista
router.post('/confirmar', verificarRol('usuario', 'admin', 'super_admin'), pagosCtrl.confirmarPago);

module.exports = router;

// ─────────────────────────────────────────────────────────────────────────────
// AGREGAR EN server.js:
//
// const pagosRoutes = require('./src/routes/pagos.routes');
// app.use('/api/pagos', pagosRoutes);
//
// IMPORTANTE: ponerlo ANTES de cualquier middleware de error global
// ─────────────────────────────────────────────────────────────────────────────
