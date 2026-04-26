import React, { useEffect, useState, useMemo } from 'react';
import { getDispositivos } from '../services/api';
import './CSS/Estadisticas_responsive.css';
import Pagination from '../components/Pagination';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ── 4 estados fijos siempre visibles ────────────────────────────────
const ESTADOS_FIJOS = [
  { key: 'Listo para Entrega', color: '#dacd1c', bg: '#fcfbdc' },
  { key: 'En Revision',        color: '#7e22ce', bg: '#f3e8ff' },
  { key: 'En Mantenimiento',   color: '#ea580c', bg: '#ffedd5' },
  { key: 'Entregado',          color: '#16a34a', bg: '#f3fef2' },
];

const COLOR_ESTADO = Object.fromEntries(ESTADOS_FIJOS.map(e => [e.key, e.color]));
const BG_ESTADO    = Object.fromEntries(ESTADOS_FIJOS.map(e => [e.key, e.bg]));

const filtrosLinea = [
  { label: 'Todos',              value: 'todos' },
  { label: 'Listo para Entrega', value: 'Listo para Entrega' },
  { label: 'En Revisión',        value: 'En Revision' },
  { label: 'En Mantenimiento',   value: 'En Mantenimiento' },
  { label: 'Entregado',          value: 'Entregado' },
];

function Estadisticas() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading]           = useState(true);

  const [filtroAnio,   setFiltroAnio]   = useState('todos');
  const [filtroMes,    setFiltroMes]    = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo,   setFiltroTipo]   = useState('todos');
  const [filtroLinea,  setFiltroLinea]  = useState('todos');
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDispositivos();
        setDispositivos(res.data);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Años disponibles en los datos ──────────────────────────────────
  const aniosDisponibles = useMemo(() => {
    const set = new Set();
    dispositivos.forEach(d => {
      if (d.fecha_registro) {
        set.add(new Date(d.fecha_registro).getFullYear());
      }
    });
    return Array.from(set).sort((a, b) => b - a); // más reciente primero
  }, [dispositivos]);

  // ── 1. Filtrar por año ──────────────────────────────────────────────
  const dispositivosPorAnio = useMemo(() => {
    if (filtroAnio === 'todos') return dispositivos;
    return dispositivos.filter(d => {
      if (!d.fecha_registro) return false;
      return new Date(d.fecha_registro).getFullYear() === parseInt(filtroAnio);
    });
  }, [dispositivos, filtroAnio]);

  // ── 2. Filtrar por mes (sobre el año) ──────────────────────────────
  const dispositivosPorMes = useMemo(() => {
    if (filtroMes === 'todos') return dispositivosPorAnio;
    const mesIdx = parseInt(filtroMes);
    return dispositivosPorAnio.filter(d => {
      if (!d.fecha_registro) return false;
      return new Date(d.fecha_registro).getMonth() + 1 === mesIdx;
    });
  }, [dispositivosPorAnio, filtroMes]);

  // ── Opciones disponibles en año+mes ────────────────────────────────
  const estadosDisponibles = useMemo(() => {
    const set = new Set(dispositivosPorMes.map(d => d.estado).filter(Boolean));
    return Array.from(set);
  }, [dispositivosPorMes]);

  const tiposDisponibles = useMemo(() => {
    const set = new Set(dispositivosPorMes.map(d => d.tipo?.trim()).filter(Boolean));
    return Array.from(set);
  }, [dispositivosPorMes]);

  // Reset si ya no existen al cambiar año/mes
  useEffect(() => {
    if (filtroEstado !== 'todos' && !estadosDisponibles.includes(filtroEstado)) setFiltroEstado('todos');
  }, [estadosDisponibles]);

  useEffect(() => {
    if (filtroTipo !== 'todos' && !tiposDisponibles.includes(filtroTipo)) setFiltroTipo('todos');
  }, [tiposDisponibles]);

  useEffect(() => { setCurrentPage(1); }, [filtroAnio, filtroMes, filtroEstado, filtroTipo]);

  // ── 3. Filtrar por estado y tipo ────────────────────────────────────
  const dispositivosFiltrados = useMemo(() => {
    return dispositivosPorMes.filter(d => {
      const okEstado = filtroEstado === 'todos' || d.estado === filtroEstado;
      const okTipo   = filtroTipo   === 'todos' || d.tipo?.trim() === filtroTipo;
      return okEstado && okTipo;
    });
  }, [dispositivosPorMes, filtroEstado, filtroTipo]);

  const total = dispositivosFiltrados.length;
  const pct   = (n) => total > 0 ? Math.round((n / total) * 100) : 0;

  // ── Conteo por estado — siempre los 4 ──────────────────────────────
  const conteoPorEstado = useMemo(() => {
    const acc = Object.fromEntries(ESTADOS_FIJOS.map(e => [e.key, 0]));
    dispositivosFiltrados.forEach(d => {
      if (d.estado && acc[d.estado] !== undefined) acc[d.estado]++;
    });
    return acc;
  }, [dispositivosFiltrados]);

  // ── Conteo por tipo ─────────────────────────────────────────────────
  const conteoPorTipo = useMemo(() => {
    const acc = {};
    dispositivosFiltrados.forEach(d => {
      const t = d.tipo?.trim() || 'Sin tipo';
      acc[t] = (acc[t] || 0) + 1;
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [dispositivosFiltrados]);

  const maxTipo = conteoPorTipo[0]?.[1] || 1;

  // ── Gráfica de líneas — independiente (respeta filtro de año) ───────
  const datosLinea = useMemo(() => {
    return MESES.map((mes, idx) => {
      const mesNum = idx + 1;
      const count = dispositivos.filter(d => {
        if (!d.fecha_registro) return false;
        const fecha   = new Date(d.fecha_registro);
        const okAnio  = filtroAnio  === 'todos' || fecha.getFullYear() === parseInt(filtroAnio);
        const okMes   = fecha.getMonth() + 1 === mesNum;
        const okEstado = filtroLinea === 'todos' || d.estado === filtroLinea;
        return okAnio && okMes && okEstado;
      }).length;
      return { mes, total: count };
    });
  }, [dispositivos, filtroAnio, filtroLinea]);

  // ── Donut ────────────────────────────────────────────────────────────
  const donutData = ESTADOS_FIJOS.map(e => ({
    label: e.key,
    count: conteoPorEstado[e.key],
    color: e.color,
    bg:    e.bg,
    pct:   pct(conteoPorEstado[e.key])
  }));

  let offset = 0;
  const donutSegments = donutData.map(seg => {
    const dash = (seg.pct / 100) * 100;
    const gap  = 100 - dash;
    const cur  = { ...seg, dash, gap, offset };
    offset += dash;
    return cur;
  });

  // ── Estilos ──────────────────────────────────────────────────────────
  const card = {
    background: 'var(--bg-card)', borderRadius: '12px',
    border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem'
  };

  const cardHeader = (titulo, extra) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
      <div style={{ width: '4px', height: '16px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px', flexShrink: 0 }}></div>
      <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{titulo}</span>
      {extra}
    </div>
  );

  const getBadgeStyle = (estado) => ({
    display: 'inline-block', fontSize: '.65rem', fontWeight: 700,
    padding: '2px 9px', borderRadius: '20px',
    background: BG_ESTADO[estado]    || '#f1f5f9',
    color:      COLOR_ESTADO[estado] || '#64748b'
  });

  const thStyle = {
    padding: '.55rem .85rem', textAlign: 'left', fontSize: '.7rem', fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em',
    whiteSpace: 'nowrap', background: 'var(--table-head)', borderBottom: '2px solid var(--border)'
  };

  const tdStyle = {
    padding: '.6rem .85rem', borderBottom: '1px solid var(--input-bg)',
    color: 'var(--text-main)', verticalAlign: 'middle', fontSize: '.8rem'
  };

  const selectStyle = {
    padding: '6px 12px', borderRadius: '8px',
    border: '1.5px solid var(--input-border)',
    background: 'var(--input-bg)', color: 'var(--text-main)',
    fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', outline: 'none',
    transition: 'border-color .2s'
  };

  const labelStyle = {
    fontSize: '.72rem', fontWeight: 700,
    color: 'var(--text-muted)', marginBottom: '4px', display: 'block'
  };

  const hayFiltros = filtroAnio !== 'todos' || filtroMes !== 'todos' || filtroEstado !== 'todos' || filtroTipo !== 'todos';

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>

      <h1 className="page-title">Estadísticas</h1>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando estadísticas...</p>
      ) : (
        <>
          {/* ── PANEL DE FILTROS ────────────────────────────────── */}
          <div style={{ ...card, display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }} className="estadisticas-filtros">
            <div style={{ width: '4px', height: '16px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px', alignSelf: 'center', flexShrink: 0 }}></div>
            <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-main)', alignSelf: 'center', marginRight: '.5rem' }}>Filtros</span>

            {/* Año */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Año</label>
              <select
                style={{ ...selectStyle, borderColor: filtroAnio !== 'todos' ? '#0492C2' : 'var(--input-border)' }}
                value={filtroAnio}
                onChange={e => { setFiltroAnio(e.target.value); setFiltroMes('todos'); setFiltroEstado('todos'); setFiltroTipo('todos'); }}>
                <option value="todos">Todos los años</option>
                {aniosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Mes */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>
                Mes
                <span style={{ marginLeft: '4px', fontSize: '.65rem', color: '#0492C2', fontWeight: 700 }}>• principal</span>
              </label>
              <select
                style={{ ...selectStyle, borderColor: filtroMes !== 'todos' ? '#0492C2' : 'var(--input-border)' }}
                value={filtroMes}
                onChange={e => { setFiltroMes(e.target.value); setFiltroEstado('todos'); setFiltroTipo('todos'); }}>
                <option value="todos">Todos los meses</option>
                {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Estado</label>
              <select
                style={{ ...selectStyle, borderColor: filtroEstado !== 'todos' ? '#0492C2' : 'var(--input-border)', opacity: estadosDisponibles.length === 0 ? 0.45 : 1 }}
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                disabled={estadosDisponibles.length === 0}>
                <option value="todos">Todos los estados</option>
                {ESTADOS_FIJOS.map(e => <option key={e.key} value={e.key}>{e.key}</option>)}
              </select>
            </div>

            {/* Tipo */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Tipo de dispositivo</label>
              <select
                style={{ ...selectStyle, borderColor: filtroTipo !== 'todos' ? '#0492C2' : 'var(--input-border)', opacity: tiposDisponibles.length === 0 ? 0.45 : 1 }}
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                disabled={tiposDisponibles.length === 0}>
                <option value="todos">Todos los tipos</option>
                {tiposDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Píldoras activas + limpiar */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {filtroAnio !== 'todos' && (
                <span style={{ fontSize: '.72rem', fontWeight: 700, background: '#e0f5ff', color: '#0492C2', padding: '3px 10px', borderRadius: '20px' }}>
                  {filtroAnio}
                </span>
              )}
              {filtroMes !== 'todos' && (
                <span style={{ fontSize: '.72rem', fontWeight: 700, background: '#e0f5ff', color: '#0492C2', padding: '3px 10px', borderRadius: '20px' }}>
                  {MESES[parseInt(filtroMes) - 1]}
                </span>
              )}
              {filtroEstado !== 'todos' && (
                <span style={{ fontSize: '.72rem', fontWeight: 700, background: BG_ESTADO[filtroEstado] || '#f1f5f9', color: COLOR_ESTADO[filtroEstado] || '#64748b', padding: '3px 10px', borderRadius: '20px' }}>
                  {filtroEstado}
                </span>
              )}
              {filtroTipo !== 'todos' && (
                <span style={{ fontSize: '.72rem', fontWeight: 700, background: 'var(--table-head)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: '20px' }}>
                  {filtroTipo}
                </span>
              )}
              {hayFiltros && (
                <button
                  onClick={() => { setFiltroAnio('todos'); setFiltroMes('todos'); setFiltroEstado('todos'); setFiltroTipo('todos'); }}
                  style={{ padding: '4px 12px', borderRadius: '8px', border: '1.5px solid var(--input-border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer' }}>
                  Limpiar ✕
                </button>
              )}
              <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                {total} resultado{total !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* ── DONUT + BARRAS ──────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="estadisticas-donut-barras">

            {/* Donut */}
            <div style={card}>
              {cardHeader('Distribución por estado', (
                <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '2px 9px', borderRadius: '20px' }}>
                  {total} total
                </span>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="estadisticas-donut-content">
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <svg width="130" height="130" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }} className="estadisticas-donut-svg">
                    {total === 0 ? (
                      <circle cx="18" cy="18" r="15.92" fill="transparent" stroke="var(--border)" strokeWidth="5"/>
                    ) : (
                      donutSegments.map((seg, i) => (
                        <circle key={i} cx="18" cy="18" r="15.92"
                          fill="transparent" stroke={seg.color} strokeWidth="5"
                          strokeDasharray={`${seg.dash} ${seg.gap}`}
                          strokeDashoffset={-seg.offset}
                        />
                      ))
                    )}
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{total}</div>
                    <div style={{ fontSize: '.6rem', color: 'var(--text-muted)' }}>total</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {donutData.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '.6rem', opacity: seg.count === 0 ? 0.4 : 1 }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, flexShrink: 0 }}></div>
                      <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', flex: 1 }}>{seg.label}</span>
                      <span style={{ fontSize: '.75rem', fontWeight: 700, color: seg.color }}>{seg.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barras */}
            <div style={card}>
              {cardHeader('Cantidad por estado')}
              {ESTADOS_FIJOS.map(e => {
                const count = conteoPorEstado[e.key];
                return (
                  <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '.9rem', opacity: count === 0 ? 0.4 : 1 }}>
                    <div style={{ fontSize: '.74rem', color: 'var(--text-muted)', width: '140px', flexShrink: 0, fontWeight: 500 }}>{e.key}</div>
                    <div style={{ flex: 1, height: '12px', background: 'var(--input-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '6px', background: e.color, width: `${pct(count)}%`, transition: 'width .5s ease' }}></div>
                    </div>
                    <div style={{ fontSize: '.74rem', fontWeight: 700, color: e.color, width: '28px', textAlign: 'right' }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── GRÁFICA DE LÍNEAS — independiente ───────────────── */}
          <div style={{ ...card, marginBottom: '1rem' }}>
            {cardHeader('Registros por mes', (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {filtrosLinea.map(f => (
                  <button key={f.value} onClick={() => setFiltroLinea(f.value)}
                    style={{
                      padding: '3px 10px', borderRadius: '20px', border: 'none',
                      fontSize: '.7rem', fontWeight: 600, cursor: 'pointer',
                      background: filtroLinea === f.value
                        ? (COLOR_ESTADO[f.value] || '#0492C2')
                        : 'var(--input-bg)',
                      color: filtroLinea === f.value ? '#fff' : 'var(--text-muted)',
                      transition: 'all .2s'
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            ))}
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={datosLinea} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--input-bg)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: '.78rem' }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text-main)' }}
                />
                <Line
                  type="monotone" dataKey="total" name="Dispositivos"
                  stroke={COLOR_ESTADO[filtroLinea] || '#0492C2'}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLOR_ESTADO[filtroLinea] || '#0492C2', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: COLOR_ESTADO[filtroLinea] || '#82EEFD' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── TIPOS ───────────────────────────────────────────── */}
          <div style={{ ...card, marginBottom: '1rem' }}>
            {cardHeader('Dispositivos por tipo')}
            {conteoPorTipo.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '.82rem', textAlign: 'center', padding: '1rem' }}>Sin datos para este filtro</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '.75rem' }} className="estadisticas-tipos-grid">
                {conteoPorTipo.map(([tipo, count]) => (
                  <div key={tipo} style={{ background: 'var(--table-head)', border: '1px solid var(--border)', borderRadius: '10px', padding: '.85rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: '.3rem', fontWeight: 500 }}>{tipo}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{count}</div>
                    <div style={{ marginTop: '.4rem', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', width: `${Math.round((count / maxTipo) * 100)}%` }}></div>
                    </div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginTop: '.3rem' }}>{pct(count)}% del total</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.25rem .75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '16px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px' }}></div>
              <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Dispositivos</span>
              <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '2px 9px', borderRadius: '20px' }}>
                {dispositivosFiltrados.length} resultado{dispositivosFiltrados.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ overflowX: 'auto' }} className="estadisticas-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse' }} className="estadisticas-table">
                <thead>
                  <tr>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Marca</th>
                    <th style={thStyle}>Ubicación</th>
                    <th style={thStyle}>Fecha</th>
                    <th style={thStyle}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {dispositivosFiltrados
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((d, i) => (
                    <tr key={d.id} style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--table-stripe)' }}>
                      <td style={tdStyle}><div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.82rem' }}>{d.nombre}</div></td>
                      <td style={tdStyle}>{d.tipo || 'N/A'}</td>
                      <td style={tdStyle}>{d.marca || 'N/A'}</td>
                      <td style={tdStyle}>{d.ubicacion || 'N/A'}</td>
                      <td style={tdStyle}>
                        {d.fecha_registro
                          ? new Date(d.fecha_registro).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </td>
                      <td style={tdStyle}><span style={getBadgeStyle(d.estado)}>{d.estado}</span></td>
                    </tr>
                  ))}
                  {dispositivosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '.82rem' }}>
                        No hay dispositivos para los filtros seleccionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              totalItems={dispositivosFiltrados.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>

        </>
      )}
    </div>
  );
}

export default Estadisticas;
