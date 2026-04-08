import React, { useEffect, useState } from 'react';
import { getDispositivos } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function Estadisticas() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroLinea, setFiltroLinea] = useState('todos');

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

  const total = dispositivos.length;

  const estados = {
    'Listo para Entrega':       { color: '#dacd1c', bg: '#fcfbdc', count: 0 },
    'En Revision':      { color: '#7e22ce', bg: '#f3e8ff', count: 0 },
    'En Mantenimiento': { color: '#ea580c', bg: '#ffedd5', count: 0 },
    'Entregado':     { color: '#16a34a', bg: '#f3fef2', count: 0 },
  };

  dispositivos.forEach(d => {
    if (estados[d.estado] !== undefined) {
      estados[d.estado].count++;
    }
  });

  const tiposAgrupados = dispositivos.reduce((acc, d) => {
    const tipo = d.tipo?.trim() || 'Sin tipo';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const tiposOrdenados = Object.entries(tiposAgrupados).sort((a, b) => b[1] - a[1]);
  const maxTipo = tiposOrdenados[0]?.[1] || 1;
  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;

 
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const datosLinea = meses.map((mes, idx) => {
    const mesNum = idx + 1;
    const filtrados = dispositivos.filter(d => {
      if (!d.fecha_registro) return false;
      const fecha = new Date(d.fecha_registro);
      const coincideMes = fecha.getMonth() + 1 === mesNum;
      if (filtroLinea === 'todos') return coincideMes;
      return coincideMes && d.estado === filtroLinea;
    });
    return { mes, total: filtrados.length };
  });


  const donutData = Object.entries(estados).map(([label, val]) => ({
    label, count: val.count, color: val.color, bg: val.bg, pct: pct(val.count)
  }));

  let offset = 0;
  const donutSegments = donutData.map(seg => {
    const dash = (seg.pct / 100) * 100;
    const gap = 100 - dash;
    const current = { ...seg, dash, gap, offset };
    offset += dash;
    return current;
  });

  const getBadgeStyle = (estado) => {
    const base = { display: 'inline-block', fontSize: '.65rem', fontWeight: 700, padding: '2px 9px', borderRadius: '20px' };
    switch (estado) {
      case 'Listo para Entrega':       return { ...base, background: '#fcfbdc', color: '#dacd1c' };
      case 'En Revision':      return { ...base, background: '#f3e8ff', color: '#7e22ce' };
      case 'En Mantenimiento': return { ...base, background: '#ffedd5', color: '#c2410c' };
      case 'Entregado':     return { ...base, background: '#f3fef2', color: '#15803d' };
      default:                 return { ...base, background: 'var(--input-bg)', color: 'var(--text-muted)' };
    }
  };

  const thStyle = {
    padding: '.55rem .85rem', textAlign: 'left', fontSize: '.7rem', fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em',
    whiteSpace: 'nowrap', background: 'var(--table-head)', borderBottom: '2px solid var(--border)'
  };

  const tdStyle = {
    padding: '.6rem .85rem', borderBottom: '1px solid var(--input-bg)',
    color: 'var(--text-main)', verticalAlign: 'middle', fontSize: '.8rem'
  };

  const card = {
    background: 'var(--bg-card)', borderRadius: '12px',
    border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem'
  };

  const cardHeader = (titulo, extra) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.1rem' }}>
      <div style={{ width: '4px', height: '16px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px' }}></div>
      <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{titulo}</span>
      {extra}
    </div>
  );

  const filtros = [
    { label: 'Todos', value: 'todos' },
    { label: 'Listo para Entrega', value: 'Listo para Entrega' },
    { label: 'En Revisión', value: 'En Revision' },
    { label: 'En Mantenimiento', value: 'En Mantenimiento' },
    { label: 'Entregado', value: 'Entregado' },
  ];

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
        Estadísticas
      </h1>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando estadísticas...</p>
      ) : (
        <>
         
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

           
            <div style={card}>
              {cardHeader('Categorías', (
                <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '2px 9px', borderRadius: '20px' }}>
                  Ver todo
                </span>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <svg width="130" height="130" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
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
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{total}</div>
                    <div style={{ fontSize: '.6rem', color: 'var(--text-muted)' }}>total</div>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  {donutData.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '.6rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, flexShrink: 0 }}></div>
                      <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', flex: 1 }}>{seg.label}</span>
                      <span style={{ fontSize: '.75rem', fontWeight: 700, color: seg.color }}>{pct(seg.count)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

           
            <div style={card}>
              {cardHeader('Distribución por estado', (
                <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '2px 9px', borderRadius: '20px' }}>
                  {total} total
                </span>
              ))}
              {Object.entries(estados).map(([label, val]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '.9rem' }}>
                  <div style={{ fontSize: '.74rem', color: 'var(--text-muted)', width: '130px', flexShrink: 0, fontWeight: 500 }}>{label}</div>
                  <div style={{ flex: 1, height: '12px', background: 'var(--input-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '6px', background: val.color, width: `${pct(val.count)}%`, transition: 'width .5s ease' }}></div>
                  </div>
                  <div style={{ fontSize: '.74rem', fontWeight: 700, color: val.color, width: '28px', textAlign: 'right' }}>
                    {val.count}
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div style={{ ...card, marginBottom: '1rem' }}>
            {cardHeader('Registros por mes', (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {filtros.map(f => (
                  <button key={f.value} onClick={() => setFiltroLinea(f.value)}
                    style={{
                      padding: '3px 10px', borderRadius: '20px', border: 'none',
                      fontSize: '.7rem', fontWeight: 600, cursor: 'pointer',
                      background: filtroLinea === f.value ? '#0492C2' : 'var(--input-bg)',
                      color: filtroLinea === f.value ? 'var(--bg-card)' : 'var(--text-muted)',
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
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '.78rem' }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text-main)' }}
                />
                <Line
                  type="monotone" dataKey="total" name="Dispositivos"
                  stroke="#0492C2" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0492C2', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#82EEFD' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        
          <div style={{ ...card, marginBottom: '1rem' }}>
            {cardHeader('Dispositivos por tipo')}
            {tiposOrdenados.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '.82rem', textAlign: 'center', padding: '1rem' }}>
                No hay datos de tipos registrados
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '.75rem' }}>
                {tiposOrdenados.map(([tipo, count]) => (
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
              <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Registros recientes</span>
              <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '2px 9px', borderRadius: '20px' }}>últimos 5</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Marca</th>
                    <th style={thStyle}>Ubicación</th>
                    <th style={thStyle}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {dispositivos.slice(0, 5).map((d, i) => (
                    <tr key={d.id} style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--table-stripe)' }}>
                      <td style={tdStyle}><div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.82rem' }}>{d.nombre}</div></td>
                      <td style={tdStyle}>{d.tipo || 'N/A'}</td>
                      <td style={tdStyle}>{d.marca || 'N/A'}</td>
                      <td style={tdStyle}>{d.ubicacion || 'N/A'}</td>
                      <td style={tdStyle}><span style={getBadgeStyle(d.estado)}>{d.estado}</span></td>
                    </tr>
                  ))}
                  {dispositivos.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '.82rem' }}>
                        No hay dispositivos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Estadisticas;
