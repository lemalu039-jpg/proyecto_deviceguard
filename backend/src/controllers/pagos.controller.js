// src/controllers/pagos.controller.js
// Adaptado a la tabla `mantenimiento` existente — NO crea tabla nueva

const MantenimientoModel = require('../models/mantenimiento.model');
const pool = require('../database/connection');

// ─── GET /api/pagos/datos/:dispositivoId ─────────────────────────────────────
// El frontend llama esto al montar PagoMantenimiento.jsx
// Busca el mantenimiento activo del dispositivo y devuelve los datos para Wompi
exports.getDatosPago = async (req, res) => {
  try {
    const { dispositivoId } = req.params;
    console.log(`[getDatosPago] Buscando mantenimiento para dispositivo ${dispositivoId}`);

    const mant = await MantenimientoModel.findActivoByDispositivo(dispositivoId);

    if (!mant) {
      console.log(`[getDatosPago] ❌ No encontrado. Consultando todos los mantenimientos del dispositivo...`);
      const todos = await (require('../database/connection')).query(
        `SELECT * FROM mantenimiento WHERE dispositivo_id = ? ORDER BY id DESC`,
        [dispositivoId]
      );
      console.log(`[getDatosPago] Mantenimientos encontrados:`, todos[0]);

      return res.status(404).json({
        error: 'No se encontró un mantenimiento activo para este dispositivo.'
      });
    }

    console.log(`[getDatosPago] ✅ Mantenimiento encontrado:`, mant.id, `- Costo: ${mant.costo}, Estado Pago: ${mant.estado_pago}`);

    if (!mant.costo || parseFloat(mant.costo) <= 0) {
      return res.status(400).json({
        error: 'El técnico aún no ha registrado el costo de este mantenimiento.'
      });
    }

    if (mant.estado_pago === 'Pagado') {
      // Devolver los datos del pago completado para que el frontend muestre el badge
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

    // Asegurarse de que tenga referencia — si no, generarla
    if (!mant.referencia_pago) {
      await MantenimientoModel.update(mant.id, {
        descripcion:          mant.descripcion,
        costo:                mant.costo,
        estado_mantenimiento: mant.estado_mantenimiento,
        tecnico_id:           mant.tecnico_id,
        estado_pago:          'Pendiente',
        referencia_pago:      `MANT-${mant.id}`
      });
      mant.referencia_pago = `MANT-${mant.id}`;
    }

    return res.json({
      mantenimiento_id: mant.id,
      monto:            parseFloat(mant.costo),
      referencia:       mant.referencia_pago,
      descripcion:      `Mantenimiento - ${mant.dispositivo_nombre} (${mant.dispositivo_serial})`,
      public_key:       process.env.WOMPI_PUBLIC_KEY,
      estado_pago:      mant.estado_pago || 'Pendiente'
    });

  } catch (error) {
    console.error('getDatosPago:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/pagos/confirmar ────────────────────────────────────────────────
// El frontend llama esto después de que Wompi aprueba el pago en el widget
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
      fecha_pago:           estado_wompi === 'APPROVED' ? new Date() : null
    });

    return res.json({ ok: true, message: `Pago actualizado a ${nuevoEstado}.` });

  } catch (error) {
    console.error('confirmarPago:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/pagos/webhook ──────────────────────────────────────────────────
// Wompi llama este endpoint directamente cuando el pago cambia de estado.
// Funciona aunque el usuario cierre el navegador — es el respaldo más confiable.
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
            fecha_pago:           tx.status === 'APPROVED' ? new Date() : null
          });

          console.log(`[Wompi Webhook] ref=${tx.reference} → ${nuevoEstado}`);
        }
      }
    }

    // Siempre 200 — si respondes otro código Wompi reintenta indefinidamente
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('webhookWompi:', error);
    return res.status(200).json({ received: true });
  }
};
