// src/controllers/pagos.controller.js
const MantenimientoModel = require('../models/mantenimiento.model');
const pool   = require('../database/connection');
const crypto = require('crypto');

// ─── Genera la firma de integridad requerida por Wompi ────────────────────────
// SHA256( referencia + monto_en_centavos + moneda + integrity_secret )
// Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web/#firma-de-integridad
function generarFirmaIntegridad(referencia, montoEnCentavos, moneda = 'COP') {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) {
    throw new Error('WOMPI_INTEGRITY_SECRET no está definido en .env');
  }
  const cadena = `${referencia}${montoEnCentavos}${moneda}${secret}`;
  return crypto.createHash('sha256').update(cadena).digest('hex');
}

// ─── GET /api/pagos/datos/:dispositivoId ─────────────────────────────────────
exports.getDatosPago = async (req, res) => {
  try {
    const { dispositivoId } = req.params;
    console.log(`[getDatosPago] dispositivo=${dispositivoId}`);

    const mant = await MantenimientoModel.findActivoByDispositivo(dispositivoId);

    if (!mant) {
      const [todos] = await pool.query(
        'SELECT * FROM mantenimiento WHERE dispositivo_id = ? ORDER BY id DESC',
        [dispositivoId]
      );
      console.log('[getDatosPago] Mantenimientos encontrados:', todos);
      return res.status(404).json({
        error: 'No se encontró un mantenimiento activo para este dispositivo.'
      });
    }

    console.log(`[getDatosPago] encontrado id=${mant.id} costo=${mant.costo} estado_pago=${mant.estado_pago}`);

    if (!mant.costo || parseFloat(mant.costo) <= 0) {
      return res.status(400).json({
        error: 'El técnico aún no ha registrado el costo de este mantenimiento.'
      });
    }

    // Pago ya completado — devolver datos sin recalcular firma
    if (mant.estado_pago === 'Pagado') {
      return res.json({
        mantenimiento_id: mant.id,
        monto:            parseFloat(mant.costo),
        referencia:       mant.referencia_pago,
        descripcion:      `Mantenimiento - ${mant.dispositivo_nombre} (${mant.dispositivo_serial})`,
        public_key:       process.env.WOMPI_PUBLIC_KEY,
        estado_pago:      'Pagado',
        transaccion_id:   mant.transaccion_id,
        fecha_pago:       mant.fecha_pago,
      });
    }

    // Normalizar: si estado_pago es null/undefined, forzarlo a 'Pendiente'
    // y asegurarse de que tenga referencia de pago
    const necesitaActualizar = !mant.referencia_pago || !mant.estado_pago;
    if (necesitaActualizar) {
      const nuevaRef = mant.referencia_pago || `MANT-${mant.id}`;
      await MantenimientoModel.update(mant.id, {
        descripcion:          mant.descripcion,
        costo:                mant.costo,
        estado_mantenimiento: mant.estado_mantenimiento,
        tecnico_id:           mant.tecnico_id,
        estado_pago:          'Pendiente',
        referencia_pago:      nuevaRef,
      });
      mant.referencia_pago = nuevaRef;
      mant.estado_pago     = 'Pendiente';
      console.log(`[getDatosPago] Normalizado: ref=${nuevaRef} estado_pago=Pendiente`);
    }

    const montoEnCentavos = Math.round(parseFloat(mant.costo) * 100);

    // Generar firma SHA256 (requerida por Wompi para abrir el widget)
    let integrity = null;
    try {
      integrity = generarFirmaIntegridad(mant.referencia_pago, montoEnCentavos, 'COP');
      console.log(`[getDatosPago] integrity generado para ref=${mant.referencia_pago}`);
    } catch (err) {
      // No bloqueamos: si falta el secret, igual devolvemos los datos
      // El error de firma aparecerá solo al intentar abrir el widget
      console.warn('[getDatosPago] No se pudo generar integrity:', err.message);
    }

    return res.json({
      mantenimiento_id:  mant.id,
      monto:             parseFloat(mant.costo),
      monto_en_centavos: montoEnCentavos,
      referencia:        mant.referencia_pago,
      descripcion:       `Mantenimiento - ${mant.dispositivo_nombre} (${mant.dispositivo_serial})`,
      public_key:        process.env.WOMPI_PUBLIC_KEY,
      integrity:         integrity,
      moneda:            'COP',
      estado_pago:       mant.estado_pago || 'Pendiente',
    });

  } catch (error) {
    console.error('getDatosPago error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/pagos/confirmar ────────────────────────────────────────────────
exports.confirmarPago = async (req, res) => {
  try {
    const { referencia, transaccion_id, estado_wompi } = req.body;

    if (!referencia || !transaccion_id) {
      return res.status(400).json({ error: 'referencia y transaccion_id son requeridos.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM mantenimiento WHERE referencia_pago = ? LIMIT 1',
      [referencia]
    );
    const mant = rows[0];

    if (!mant) {
      return res.status(404).json({ error: 'No se encontró el mantenimiento con esa referencia.' });
    }

    const nuevoEstado = estado_wompi === 'APPROVED' ? 'Pagado' : 'Rechazado';

    await MantenimientoModel.update(mant.id, {
      descripcion:          mant.descripcion,
      costo:                mant.costo,
      estado_mantenimiento: mant.estado_mantenimiento,
      tecnico_id:           mant.tecnico_id,
      estado_pago:          nuevoEstado,
      referencia_pago:      mant.referencia_pago,
      transaccion_id:       transaccion_id,
      fecha_pago:           estado_wompi === 'APPROVED' ? new Date() : null,
    });

    return res.json({ ok: true, message: `Pago actualizado a ${nuevoEstado}.` });

  } catch (error) {
    console.error('confirmarPago error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/pagos/webhook ──────────────────────────────────────────────────
// Wompi llama este endpoint cuando el estado de una transacción cambia.
// Registrar en: https://dashboard.wompi.co → Desarrolladores → Webhooks
exports.webhookWompi = async (req, res) => {
  try {
    const evento = req.body;

    if (evento?.event === 'transaction.updated') {
      const tx = evento.data?.transaction;

      if (tx?.reference) {
        const [rows] = await pool.query(
          'SELECT * FROM mantenimiento WHERE referencia_pago = ? LIMIT 1',
          [tx.reference]
        );
        const mant = rows[0];

        if (mant) {
          const nuevoEstado = tx.status === 'APPROVED' ? 'Pagado' : tx.status;

          await MantenimientoModel.update(mant.id, {
            descripcion:          mant.descripcion,
            costo:                mant.costo,
            estado_mantenimiento: mant.estado_mantenimiento,
            tecnico_id:           mant.tecnico_id,
            estado_pago:          nuevoEstado,
            referencia_pago:      mant.referencia_pago,
            transaccion_id:       tx.id,
            fecha_pago:           tx.status === 'APPROVED' ? new Date() : null,
          });

          console.log(`[Wompi Webhook] ref=${tx.reference} → ${nuevoEstado}`);
        }
      }
    }

    // Siempre 200 — si respondes otro código Wompi reintenta indefinidamente
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('webhookWompi error:', error);
    return res.status(200).json({ received: true });
  }
};
