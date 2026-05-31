import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDispositivos, getDispositivosAsignados, getUsuarios } from '../services/api';
import api from '../services/api';
import { estadosDispositivo } from "../ejemplo/generador2";
import Pagination from '../components/Pagination';
import TableSkeleton from '../components/TableSkeleton';
import { useLanguage } from '../context/LanguageContext.jsx';
// ── CAMBIO 1: importar el modal en lugar de navegar a otra página ──────────────
import PagoMantenimientoModal from './PagoMantenimiento';
import './css/Dashboard.css';

// Icono SVG según el tipo de dispositivo
const IconoTipoDispositivo = ({ tipo = "" }) => {
  const t = tipo.toLowerCase();

  if (t.includes("portátil") || t.includes("portatil") || t.includes("laptop") || t.includes("notebook")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M2 17h20M1 21h22"/>
      </svg>
    );
  }
  if (t.includes("tablet") || t.includes("ipad")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <circle cx="12" cy="18" r="1" fill="currentColor"/>
      </svg>
    );
  }
  if (t.includes("impresora") || t.includes("printer") || t.includes("impresión")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
        <line x1="9" y1="18" x2="15" y2="18"/>
      </svg>
    );
  }
  if (t.includes("monitor") || t.includes("pantalla") || t.includes("televisor") || t.includes("tv") || t.includes("display")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    );
  }
  if (t.includes("proyector") || t.includes("projector")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="16" height="10" rx="2"/>
        <circle cx="21" cy="12" r="1" fill="currentColor"/>
        <line x1="18" y1="12" x2="20" y2="12"/>
        <circle cx="9" cy="12" r="2"/>
      </svg>
    );
  }
  if (t.includes("pc") || t.includes("computador") || t.includes("desktop") || t.includes("torre") || t.includes("all-in-one") || t.includes("allinone")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="8" height="20" rx="2"/>
        <rect x="14" y="2" width="8" height="6" rx="1"/>
        <rect x="14" y="12" width="8" height="10" rx="1"/>
        <circle cx="6" cy="18" r="1" fill="currentColor"/>
      </svg>
    );
  }
  if (t.includes("teléfono") || t.includes("telefono") || t.includes("celular") || t.includes("smartphone") || t.includes("móvil") || t.includes("movil")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <circle cx="12" cy="18" r="1" fill="currentColor"/>
      </svg>
    );
  }
  if (t.includes("escáner") || t.includes("escaner") || t.includes("scanner")) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="6" y1="2" x2="6" y2="6"/>
        <line x1="18" y1="2" x2="18" y2="6"/>
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  );
};

function Dashboard() {
  const { t, translateTipo, translateEstado, translateUbicacion } = useLanguage();

  useEffect(() => {
    const generador = estadosDispositivo();
    console.log(generador.next().value);
    console.log(generador.next().value);
    console.log(generador.next().value);
    console.log(generador.next().value);
    console.log(generador.next().value);
  }, []);

  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDispositivos: 0,
    listoparaEntrega: 0,
    enRevision: 0,
    enMantenimiento: 0,
    entregado: 0,
    usuarios: 0,
    totalMantenimientos: 0
  });

  const [dispositivos, setDispositivos] = useState([]);
  const [pagosDispositivos, setPagosDispositivos] = useState({});
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [imagenActiva, setImagenActiva] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // ── CAMBIO 2: estado para controlar qué modal de pago está abierto ──────────
  const [pagoModalId, setPagoModalId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, usuariosRes] = await Promise.all([
          getDispositivos(),
          getUsuarios(),
        ]);
        const reportesRes = await api.get('/reportes/total');

        const allDevices = devicesRes.data;
        const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
        let dispositivos;

        if (usuarioActual.rol === 'tecnico') {
          const asignadosRes = await getDispositivosAsignados(usuarioActual.id);
          dispositivos = asignadosRes.data || [];
        } else if (usuarioActual.rol === 'usuario') {
          dispositivos = allDevices.filter(d => d.usuario_id === usuarioActual.id);
        } else {
          dispositivos = allDevices;
        }

        setStats({
          totalDispositivos: dispositivos.length,
          listoparaEntrega:     dispositivos.filter(d => d.estado === 'Listo para Entrega').length,
          enRevision:      dispositivos.filter(d => d.estado === 'En Revision').length,
          enMantenimiento: dispositivos.filter(d => d.estado === 'En Mantenimiento').length,
          entregado:      dispositivos.filter(d => d.estado === 'Entregado').length,
          usuarios:        usuariosRes.data.length,
          totalMantenimientos: reportesRes.data.total
        });
        setDispositivos(dispositivos);

        // Cargar estado de pago para dispositivos en Listo para Entrega o Entregado
        // Para todos los roles (admin ve el estado, usuario puede pagar)
        const dispositivosConPago = dispositivos.filter(
          d => d.estado === 'Listo para Entrega' || d.estado === 'Entregado'
        );
        if (dispositivosConPago.length > 0) {
          const pagosMap = {};
          await Promise.all(
            dispositivosConPago.map(async (d) => {
              try {
                const res = await api.get(`/pagos/datos/${d.id}`, {
                  headers: { 'x-usuario-id': usuarioActual.id }
                });
                pagosMap[d.id] = res.data;
              } catch (err) {
                const msg = err.response?.data?.error || '';
                if (msg.includes('no ha registrado')) {
                  pagosMap[d.id] = { sinMonto: true };
                } else {
                  pagosMap[d.id] = null;
                }
              }
            })
          );
          setPagosDispositivos(pagosMap);
        }
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBadgeStyle = (estado) => {
    const base = {
      display: 'inline-block',
      fontSize: '.68rem',
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: '20px',
      letterSpacing: '.3px'
    };
    switch (estado) {
      case 'Listo para Entrega': return { ...base, background: 'rgba(34,197,94,0.15)',   color: '#22c55e', whiteSpace: 'nowrap' };
      case 'En Revision':        return { ...base, background: 'rgba(245,158,11,0.15)',  color: '#f59e0b', whiteSpace: 'nowrap' };
      case 'En Mantenimiento':   return { ...base, background: 'rgba(192,132,252,0.15)', color: '#c084fc', whiteSpace: 'nowrap' };
      case 'Entregado':          return { ...base, background: 'rgba(56,189,248,0.15)',  color: '#38bdf8', whiteSpace: 'nowrap' };
      default:                   return { ...base, background: 'var(--input-bg)', color: 'var(--text-muted)', whiteSpace: 'nowrap' };
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const thStyle = {
    padding: '.6rem .85rem',
    textAlign: 'left',
    fontSize: '.71rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    whiteSpace: 'nowrap'
  };

  const tdStyle = {
    padding: '.5rem .75rem',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-main)',
    verticalAlign: 'middle',
    fontSize: '.81rem',
  };

  const IconoTotal = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0492C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  );
  const IconoListoparaentrega = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
  const IconoRevision = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const IconoMantenimiento = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
  const IconoEntregado = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7l-8-4-8 4v10l8 4 8-4V7z"/>
      <polyline points="4 7 12 11 20 7"/>
      <line x1="12" y1="11" x2="12" y2="21"/>
      <polyline points="15 12 17 14 21 10" strokeWidth="2.2"/>
    </svg>
  );

  const cards = [
    {
      label: t('dash_total_equipos'),
      value: stats.totalDispositivos,
      accentColor: 'linear-gradient(135deg, #0492C2, #82EEFD)',
      textColor: '#0492C2',
      iconBg: 'rgba(4, 146, 194, .1)',
      icono: <IconoTotal />,
      badge: null,
      sub: `${stats.usuarios} ${t('dash_usuarios_registrados')}`,
      subColor: '#10b981'
    },
    {
      label: t('dash_listo_entrega'),
      value: stats.listoparaEntrega,
      accentColor: '#22c55e',
      textColor: '#22c55e',
      iconBg: 'rgba(34, 197, 94, 0.12)',
      icono: <IconoListoparaentrega />,
      badge: { label: t('dash_listo_entrega'), bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }
    },
    {
      label: t('dash_en_revision'),
      value: stats.enRevision,
      accentColor: '#f59e0b',
      textColor: '#f59e0b',
      iconBg: 'rgba(245, 158, 11, 0.12)',
      icono: <IconoRevision />,
      badge: { label: t('dash_en_revision'), bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }
    },
    {
      label: t('dash_en_mantenimiento'),
      value: stats.enMantenimiento,
      accentColor: '#c084fc',
      textColor: '#c084fc',
      iconBg: 'rgba(192, 132, 252, 0.12)',
      icono: <IconoMantenimiento />,
      badge: { label: t('dash_en_mantenimiento'), bg: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }
    },
    {
      label: t('dash_entregado'),
      value: stats.entregado,
      accentColor: '#38bdf8',
      textColor: '#38bdf8',
      iconBg: 'rgba(56, 189, 248, 0.12)',
      icono: <IconoEntregado />,
      badge: { label: t('dash_entregado'), bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }
    },
    {
      label: t('dash_total_reportes'),
      value: stats.totalMantenimientos,
      accentColor: '#fb923c',
      textColor: '#fb923c',
      iconBg: 'rgba(251, 146, 60, 0.12)',
      icono: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
      ),
      badge: { label: t('dash_reportes_enviados'), bg: 'rgba(251, 146, 60, 0.15)', color: '#fb923c' }
    },
  ];

  const cardW = 'calc(25% - 0.75rem)';

  const renderCard = (card, i) => (
    <div key={i} className={`card-3d dash-card animate-fade-in-up delay-${(i + 1) * 100}`}>
      {/* Barra de acento lateral */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: '4px', height: '100%',
        background: card.accentColor,
        borderRadius: '12px 0 0 12px'
      }} />

      {/* Etiqueta */}
      <p className="dash-card-label" style={{
        color: 'var(--text-muted)', fontWeight: 500,
        fontSize: '.8rem', margin: '0 0 .4rem 0'
      }}>
        {card.label}
      </p>

      {/* Número + ícono */}
      <div className="dash-card-row" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '.65rem'
      }}>
        <h2 className="dash-card-value" style={{
          fontSize: '2rem', fontWeight: 700, margin: 0, color: card.textColor
        }}>
          {card.value}
        </h2>
        <div className="dash-card-icon" style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: card.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {card.icono}
        </div>
      </div>

      {/* Badge / sub-texto */}
      <div>
        {card.badge ? (
          <span className="dash-card-badge" style={{
            display: 'inline-block',
            background: card.badge.bg, color: card.badge.color,
            padding: '2px 8px', borderRadius: '20px',
            fontWeight: 700, fontSize: '.65rem'
          }}>
            {card.badge.label}
          </span>
        ) : (
          <p className="dash-card-sub" style={{ fontSize: '.75rem', margin: 0, color: card.subColor, fontWeight: 600 }}>
            {JSON.parse(localStorage.getItem('usuario')||'{}').rol === 'usuario' ? null : card.sub}
          </p>
        )}
      </div>
    </div>
  );

  // ── Celda de pago para todos los roles ───────────────────────────────────
  const renderCeldaPago = (d) => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Solo mostrar para dispositivos relevantes
    if (d.estado !== 'Listo para Entrega' && d.estado !== 'Entregado') {
      return <td style={tdStyle}>—</td>;
    }
    const pago = pagosDispositivos[d.id];

    // Sin datos de pago aún
    if (!pago || !pago.monto) {
      return (
        <td style={tdStyle}>
          <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>—</span>
        </td>
      );
    }

    // Ya pagado — todos los roles ven el badge verde
    if (pago.estado_pago === 'Pagado') {
      return (
        <td style={tdStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(34,197,94,.12)', color: '#16a34a',
              fontSize: '.68rem', fontWeight: 700,
              padding: '3px 10px', borderRadius: 20,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Pagado
            </span>
            <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>
              {Number(pago.monto).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
            </span>
          </div>
        </td>
      );
    }

    // Pendiente — solo el rol usuario ve el botón de pagar; admin/tecnico ven badge amarillo
    if (usuarioActual.rol === 'usuario') {
      return (
        <td style={tdStyle}>
          <button
            onClick={(e) => { e.stopPropagation(); setPagoModalId(d.id); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, #0492C2, #0369a1)',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: '.72rem', fontWeight: 600,
              padding: '5px 12px', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Pagar {Number(pago.monto).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
          </button>
        </td>
      );
    }

    // Admin / tecnico / super_admin — badge amarillo "Pendiente"
    return (
      <td style={tdStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(245,158,11,.12)', color: '#d97706',
            fontSize: '.68rem', fontWeight: 700,
            padding: '3px 10px', borderRadius: 20,
          }}>
            Pendiente
          </span>
          <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>
            {Number(pago.monto).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
          </span>
        </div>
      </td>
    );
  };

  // ── CAMBIO 4: callback que actualiza la celda localmente tras pagar ────────
  const handlePagado = (dispositivoId) => {
    setPagosDispositivos(prev => ({
      ...prev,
      [dispositivoId]: { ...prev[dispositivoId], estado_pago: 'Pagado' }
    }));
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.6rem', color: 'var(--text-main)' }}>{t('dash_inicio')}</h1>

      {loading ? (
        <p>{t('cargando_info')}</p>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          <div className="dash-cards-grid">
            {cards
              .filter(card => !(card.label === 'Total reportes' && JSON.parse(localStorage.getItem('usuario') || '{}').rol === 'usuario'))
              .map((card, i) => renderCard(card, i))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ width: '4px', height: '18px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px', flexShrink: 0 }}></div>
        <span style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{t('dash_lista_dispositivos')}</span>
        <input
          type="text"
          placeholder={t('dash_buscar_ph')}
          value={filtroBusqueda}
          onChange={e => { setFiltroBusqueda(e.target.value); setCurrentPage(1); }}
          style={{ flex: 1, minWidth: '180px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none' }}
        />
        <select
          value={filtroEstado}
          onChange={e => { setFiltroEstado(e.target.value); setCurrentPage(1); }}
          style={{ padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}
        >
          <option value="">{t('dash_todos_estados')}</option>
          <option value="En Revision">{t('dash_en_revision')}</option>
          <option value="En Mantenimiento">{t('dash_en_mantenimiento')}</option>
          <option value="Listo para Entrega">{t('dash_listo_entrega')}</option>
          <option value="Entregado">{t('dash_entregado')}</option>
        </select>
        {(filtroEstado || filtroBusqueda) && (
          <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda(''); setCurrentPage(1); }} style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            {t('dash_limpiar')}
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.81rem' }}>
            <thead>
              <tr style={{ background: 'var(--table-head)', borderBottom: '2px solid var(--border)' }}>
                <th style={thStyle}>{t('dash_col_imagen')}</th>
                <th style={thStyle}>{t('dash_col_nombre')}</th>
                <th style={thStyle}>{t('dash_col_serial')}</th>
                <th style={thStyle}>{t('dash_col_ubicacion')}</th>
                <th style={thStyle}>{t('dash_col_fecha_reg')}</th>
                <th style={thStyle}>{t('dash_col_estado')}</th>
                {JSON.parse(localStorage.getItem('usuario')||'{}').rol==='super_admin' && <th style={thStyle}>{t('dash_col_reg_por')}</th>}
                <th style={thStyle}>Pago</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={7} cols={7} noWrapper />
              ) : (() => {
                const filtrados = dispositivos.filter(d => {
                  const texto = `${d.nombre} ${d.serial} ${d.ubicacion}`.toLowerCase();
                  const okBusqueda = !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
                  const okEstado = !filtroEstado || d.estado === filtroEstado;
                  return okBusqueda && okEstado;
                });
                return filtrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((d, i) => (
                  <tr key={d.id} style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--table-stripe)' }}>
                    <td style={tdStyle}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '8px',
                        background: 'rgba(4, 146, 194, 0.1)',
                        border: '1.5px solid rgba(130, 238, 253, 0.35)',
                        overflow: 'hidden', flexShrink: 0,
                        boxShadow: '0 0 0 1px rgba(130, 238, 253, 0.08)'
                      }}>
                        {d.archivo
                         ? <img
                            src={`http://localhost:5000/uploads/${d.archivo}`}
                            alt={d.nombre}
                            onClick={() => setImagenActiva(`http://localhost:5000/uploads/${d.archivo}`)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }} />
                          : <span style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              height: '100%', color: '#82EEFD', opacity: 0.85
                            }}>
                              <IconoTipoDispositivo tipo={d.tipo} />
                            </span>
                        }
                      </div>
                    </td>
                    <td onClick={() => navigate(`/historial/${d.id}`)} style={{...tdStyle, cursor: 'pointer'}} className="hover-link">
                      <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '.82rem', textDecoration: 'underline dotted' }}>{d.nombre}</div>
                      <div style={{ fontSize: '.71rem', color: 'var(--text-muted)', marginTop: '1px' }}>{translateTipo(d.tipo)}</div>
                    </td>
                    <td onClick={() => navigate(`/historial/${d.id}`)} style={{ ...tdStyle, fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace', cursor: 'pointer' }} className="hover-link">{d.serial}</td>
                    <td onClick={() => navigate(`/historial/${d.id}`)} style={{ ...tdStyle, fontSize: '.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="hover-link">{translateUbicacion(d.ubicacion) || 'N/A'}</td>
                    <td onClick={() => navigate(`/historial/${d.id}`)} style={{ ...tdStyle, fontSize: '.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="hover-link">
                      {formatFecha(d.fecha_registro)}
                      {d.hora_registro && (
                        <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {d.hora_registro}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={getBadgeStyle(d.estado)}>{translateEstado(d.estado)}</span>
                    </td>
                    {JSON.parse(localStorage.getItem('usuario')||'{}').rol==='super_admin' && (
                      <td style={{ ...tdStyle, fontSize: '.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {d.registrado_por || '—'}
                      </td>
                    )}
                    {renderCeldaPago(d)}
                  </tr>
                ));
              })()}
              {!loading && dispositivos.filter(d => {
                const texto = `${d.nombre} ${d.serial} ${d.ubicacion}`.toLowerCase();
                return (!filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase())) && (!filtroEstado || d.estado === filtroEstado);
              }).length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '.82rem' }}>
                    {t('dash_no_dispositivos')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        totalItems={dispositivos.filter(d => {
          const texto = `${d.nombre} ${d.serial} ${d.ubicacion}`.toLowerCase();
          const okBusqueda = !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
          const okEstado = !filtroEstado || d.estado === filtroEstado;
          return okBusqueda && okEstado;
        }).length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Lightbox de imagen */}
      {imagenActiva && (
        <div
          onClick={() => setImagenActiva(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(6px)' }}>
          <img
            src={imagenActiva}
            alt="preview"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}/>
        </div>
      )}

      {/* ── CAMBIO 5: modal de pago — se renderiza aquí, sin cambiar de ruta ── */}
      <PagoMantenimientoModal
        dispositivoId={pagoModalId}
        onClose={() => setPagoModalId(null)}
        onPagado={handlePagado}
      />
    </div>
  );
}

export default Dashboard;
