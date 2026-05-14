// src/pages/PagoMantenimiento.jsx
// Vista de pago para el rol "usuario" — usa el Widget oficial de Wompi

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

// ─── Carga el script oficial de Wompi una sola vez en el DOM ─────────────────
const WOMPI_SCRIPT = 'https://checkout.wompi.co/widget.js';

function useWompiScript() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (document.querySelector(`script[src="${WOMPI_SCRIPT}"]`)) {
      setLoaded(true);
      return;
    }
    const s = document.createElement('script');
    s.src = WOMPI_SCRIPT;
    s.async = true;
    s.onload = () => setLoaded(true);
    document.body.appendChild(s);
  }, []);
  return loaded;
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function PagoMantenimiento() {
  const { dispositivoId } = useParams();   // ruta: /pago/:dispositivoId
  const navigate          = useNavigate();
  const wompiLoaded       = useWompiScript();
  const usuarioActual     = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [datosPago, setDatosPago] = useState(null);
  const [estado,    setEstado]    = useState('cargando'); // cargando|listo|procesando|pagado|error
  const [mensaje,   setMensaje]   = useState('');

  // ── 1. Pedir datos del pago al backend ───────────────────────────────────
  useEffect(() => {
    if (!dispositivoId) return;

    api.get(`/pagos/datos/${dispositivoId}`, {
      headers: { 'x-usuario-id': usuarioActual.id }
    })
      .then(({ data }) => {
        setDatosPago(data);
        setEstado('listo');
      })
      .catch((err) => {
        setEstado('error');
        setMensaje(err.response?.data?.error || 'No se pudo cargar la información del pago.');
      });
  }, [dispositivoId]);

  // ── 2. Abrir el widget de Wompi ──────────────────────────────────────────
  function abrirWompi() {
    if (!wompiLoaded || !datosPago) return;
    setEstado('procesando');

    // WidgetCheckout es inyectado globalmente por el script de Wompi
    // eslint-disable-next-line no-undef
    const checkout = new WidgetCheckout({
      currency:       'COP',
      amountInCents:  Math.round(datosPago.monto * 100), // Wompi trabaja en centavos
      reference:      datosPago.referencia,
      publicKey:      datosPago.public_key,
    });

    checkout.open((result) => {
      const { transaction } = result;

      // El usuario cerró el popup sin pagar
      if (!transaction) {
        setEstado('listo');
        return;
      }

      if (transaction.status === 'APPROVED') {
        // ── 3. Notificar al backend que el pago fue aprobado ───────────────
        api.post('/pagos/confirmar', {
          referencia:     datosPago.referencia,
          transaccion_id: transaction.id,
          estado_wompi:   transaction.status,
        }, {
          headers: { 'x-usuario-id': usuarioActual.id }
        })
          .then(() => {
            setEstado('pagado');
            setMensaje('¡Pago realizado con éxito! Tu dispositivo continuará su proceso.');
          })
          .catch(() => {
            // Pago aprobado en Wompi pero falló la actualización en BD
            // El webhook del backend lo corregirá automáticamente
            setEstado('pagado');
            setMensaje('Pago aprobado. Si el estado no se actualiza en breve, contacta con soporte.');
          });

      } else {
        setEstado('listo');
        setMensaje(
          transaction.status === 'DECLINED'
            ? 'El pago fue rechazado. Verifica los datos de tu tarjeta e intenta de nuevo.'
            : 'El pago no pudo procesarse. Intenta de nuevo.'
        );
      }
    });
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0492C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <h2 style={s.title}>Pago de mantenimiento</h2>
          <p style={s.subtitle}>DeviceGuard · Servicio técnico</p>
        </div>

        {/* ── Estado: cargando ── */}
        {estado === 'cargando' && (
          <div style={s.centered}>
            <div style={s.spinner} />
            <p style={s.hint}>Cargando información del pago...</p>
          </div>
        )}

        {/* ── Estado: error ── */}
        {estado === 'error' && (
          <>
            <div style={{ ...s.alert, ...s.alertDanger }}>
              <span>⚠️</span>
              <span>{mensaje}</span>
            </div>
            <button style={{ ...s.btn, background: 'var(--bs-secondary, #6c757d)', marginTop: '1rem' }}
              onClick={() => navigate(-1)}>
              ← Volver
            </button>
          </>
        )}

        {/* ── Estado: listo | procesando ── */}
        {(estado === 'listo' || estado === 'procesando') && datosPago && (
          <>
            {/* Detalle del cobro */}
            <div style={s.detalleBox}>
              <div style={s.fila}>
                <span style={s.label}>Dispositivo</span>
                <span style={s.valor}>{datosPago.descripcion}</span>
              </div>
              <div style={s.fila}>
                <span style={s.label}>Referencia</span>
                <span style={{ ...s.valor, fontFamily: 'monospace', fontSize: '.78rem' }}>
                  {datosPago.referencia}
                </span>
              </div>
              <div style={{ ...s.fila, borderBottom: 'none', paddingBottom: 0 }}>
                <span style={s.label}>Total a pagar</span>
                <span style={s.monto}>
                  {Number(datosPago.monto).toLocaleString('es-CO', {
                    style: 'currency', currency: 'COP', minimumFractionDigits: 0
                  })}
                </span>
              </div>
            </div>

            {/* Aviso si el pago fue rechazado antes */}
            {mensaje && (
              <div style={{ ...s.alert, ...s.alertWarning }}>
                <span>⚠️</span>
                <span>{mensaje}</span>
              </div>
            )}

            {/* Botón pagar */}
            <button
              style={{
                ...s.btn,
                opacity:  (estado === 'procesando' || !wompiLoaded) ? 0.65 : 1,
                cursor:   (estado === 'procesando' || !wompiLoaded) ? 'not-allowed' : 'pointer',
              }}
              onClick={abrirWompi}
              disabled={estado === 'procesando' || !wompiLoaded}
            >
              {estado === 'procesando'
                ? <><span style={s.spinnerSm} /> Abriendo pasarela...</>
                : <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 8 }}>
                      <rect x="1" y="4" width="22" height="16" rx="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Pagar ahora
                  </>
              }
            </button>

            {/* Medios de pago */}
            <div style={s.medios}>
              <span style={s.hint}>Paga con:</span>
              <div style={s.mediosList}>
                {['Visa', 'Mastercard', 'PSE', 'Nequi', 'Bancolombia'].map(m => (
                  <span key={m} style={s.medioBadge}>{m}</span>
                ))}
              </div>
            </div>

            <p style={s.seguro}>
              🔒 Pago procesado por <strong>Wompi</strong>.
              DeviceGuard no almacena datos de tarjetas.
            </p>
          </>
        )}

        {/* ── Estado: pagado ── */}
        {estado === 'pagado' && (
          <div style={s.successBox}>
            <div style={s.successIcon}>✓</div>
            <h3 style={s.successTitle}>¡Pago exitoso!</h3>
            <p style={s.successMsg}>{mensaje}</p>
            <button
              style={{ ...s.btn, marginTop: '1.5rem', background: '#16a34a' }}
              onClick={() => navigate('/dashboard')}
            >
              Volver al inicio
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Estilos — usan las mismas variables CSS del proyecto (--bg-card, --border, etc.) ──
const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'var(--bg-main, #f4f6fb)',
  },
  card: {
    background: 'var(--bg-card, #fff)',
    border: '1px solid var(--border, #e2e8f0)',
    borderRadius: 16,
    padding: '2rem 2rem 1.5rem',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 4px 32px rgba(0,0,0,.07)',
  },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  headerIcon: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'rgba(4,146,194,.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
  },
  title: {
    fontSize: '1.2rem', fontWeight: 700,
    color: 'var(--text-main, #1e293b)', margin: '0 0 4px',
  },
  subtitle: { fontSize: '.8rem', color: 'var(--text-muted, #64748b)', margin: 0 },
  detalleBox: {
    background: 'var(--input-bg, #f8fafc)',
    border: '1px solid var(--border, #e2e8f0)',
    borderRadius: 10, padding: '1rem 1.1rem', marginBottom: '1.25rem',
  },
  fila: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 10, marginBottom: 10,
    borderBottom: '1px solid var(--border, #e2e8f0)',
  },
  label: { fontSize: '.78rem', color: 'var(--text-muted, #64748b)' },
  valor: {
    fontSize: '.83rem', fontWeight: 500,
    color: 'var(--text-main, #1e293b)',
    textAlign: 'right', maxWidth: '65%',
  },
  monto: { fontSize: '1.35rem', fontWeight: 700, color: '#0492C2' },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', padding: '11px',
    background: 'linear-gradient(135deg, #0492C2, #0369a1)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: '.92rem', fontWeight: 600, cursor: 'pointer',
    transition: 'opacity .15s',
  },
  medios: { marginTop: '1rem', textAlign: 'center' },
  mediosList: {
    display: 'flex', flexWrap: 'wrap', gap: 6,
    justifyContent: 'center', marginTop: 6,
  },
  medioBadge: {
    fontSize: '.72rem',
    background: 'var(--input-bg, #f1f5f9)',
    border: '1px solid var(--border, #e2e8f0)',
    borderRadius: 6, padding: '3px 10px',
    color: 'var(--text-muted, #64748b)', fontWeight: 500,
  },
  seguro: {
    fontSize: '.72rem', color: 'var(--text-muted, #94a3b8)',
    textAlign: 'center', marginTop: '1rem', marginBottom: 0,
  },
  alert: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    padding: '10px 12px', borderRadius: 8,
    fontSize: '.82rem', marginBottom: '1rem',
  },
  alertDanger: {
    background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c',
  },
  alertWarning: {
    background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e',
  },
  centered: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '2rem 0', gap: 12,
  },
  spinner: {
    width: 32, height: 32,
    border: '3px solid var(--border, #e2e8f0)',
    borderTop: '3px solid #0492C2',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  spinnerSm: {
    display: 'inline-block', width: 15, height: 15,
    border: '2px solid rgba(255,255,255,.4)',
    borderTop: '2px solid #fff',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    marginRight: 8,
  },
  hint: { fontSize: '.78rem', color: 'var(--text-muted, #64748b)' },
  successBox: { textAlign: 'center', padding: '1rem 0' },
  successIcon: {
    width: 56, height: 56, borderRadius: '50%',
    background: '#dcfce7', color: '#16a34a',
    fontSize: '1.6rem', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  successTitle: {
    fontSize: '1.1rem', fontWeight: 700,
    color: 'var(--text-main, #1e293b)', margin: '0 0 8px',
  },
  successMsg: { fontSize: '.84rem', color: 'var(--text-muted, #64748b)', margin: 0 },
};
