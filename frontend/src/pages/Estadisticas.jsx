import React, { useEffect, useState } from 'react';
import { getDispositivos } from '../services/api';

function Estadisticas() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);

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
    'Disponible':       { color: '#16a34a', bg: '#dcfce7', count: 0 },
    'En Revision':      { color: '#7e22ce', bg: '#f3e8ff', count: 0 },
    'En Mantenimiento': { color: '#ea580c', bg: '#ffedd5', count: 0 },
    'Dado de Baja':     { color: '#991b1b', bg: '#fef2f2', count: 0 },
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

  const tiposOrdenados = Object.entries(tiposAgrupados)
    .sort((a, b) => b[1] - a[1]);

  const maxTipo = tiposOrdenados[0]?.[1] || 1;

  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;

  const thStyle = {
    padding: '.55rem .85rem',
    textAlign: 'left',
    fontSize: '.7rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    whiteSpace: 'nowrap',
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0'
  };

  const tdStyle = {
    padding: '.6rem .85rem',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    verticalAlign: 'middle',
    fontSize: '.8rem'
  };

  const getBadgeStyle = (estado) => {
    const base = {
      display: 'inline-block',
      fontSize: '.65rem',
      fontWeight: 700,
      padding: '2px 9px',
      borderRadius: '20px',
    };
    switch (estado) {
      case 'Disponible':       return { ...base, background: '#dcfce7', color: '#15803d' };
      case 'En Revision':      return { ...base, background: '#f3e8ff', color: '#7e22ce' };
      case 'En Mantenimiento': return { ...base, background: '#ffedd5', color: '#c2410c' };
      case 'Dado de Baja':     return { ...base, background: '#fef2f2', color: '#991b1b' };
      default:                 return { ...base, background: '#f1f5f9', color: '#64748b' };
    }
  };


  const donutData = Object.entries(estados).map(([label, val]) => ({
    label,
    count: val.count,
    color: val.color,
    pct: pct(val.count)
  }));

  let offset = 0;
  const donutSegments = donutData.map(seg => {
    const dash = (seg.pct / 100) * 100;
    const gap = 100 - dash;
    const current = { ...seg, dash, gap, offset };
    offset += dash;
    return current;
  });

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
        Estadísticas
      </h1>

      {loading ? (
        <p style={{ color: '#64748b' }}>Cargando estadísticas...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

         
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.1rem' }}>
                <div style={{ width: '4px', height: '16px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '.88rem', fontWeight: 700, color: '#1a1a2e' }}>Distribución por estado</span>
                <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 9px', borderRadius: '20px' }}>
                  {total} total
                </span>
              </div>

              {Object.entries(estados).map(([label, val]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '.9rem' }}>
                  <div style={{ fontSize: '.75rem', color: '#475569', width: '130px', flexShrink: 0, fontWeight: 500 }}>
                    {label}
                  </div>
                  <div style={{ flex: 1, height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '6px',
                      background: val.color,
                      width: `${pct(val.count)}%`,
                      transition: 'width .5s ease'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '.74rem', fontWeight: 700, color: val.color, width: '28px', textAlign: 'right' }}>
                    {val.count}
                  </div>
                </div>
              ))}
            </div>

            {/* torta */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.1rem' }}>
                <div style={{ width: '4px', height: '16px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '.88rem', fontWeight: 700, color: '#1a1a2e' }}>Estado actual</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <svg width="140" height="140" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    {total === 0 ? (
                      <circle cx="18" cy="18" r="15.92" fill="transparent" stroke="#e2e8f0" strokeWidth="6"/>
                    ) : (
                      donutSegments.map((seg, i) => (
                        <circle key={i} cx="18" cy="18" r="15.92"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="6"
                          strokeDasharray={`${seg.dash} ${seg.gap}`}
                          strokeDashoffset={-seg.offset}
                        />
                      ))
                    )}
                  </svg>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e' }}>{total}</div>
                    <div style={{ fontSize: '.65rem', color: '#94a3b8' }}>total</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                  {Object.entries(estados).map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.75rem', color: '#475569' }}>
                      <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: val.color, flexShrink: 0 }}></div>
                      <span>{label}</span>
                      <span style={{ fontWeight: 700, color: '#1a1a2e', marginLeft: 'auto', paddingLeft: '12px' }}>
                        {val.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

       
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.1rem' }}>
              <div style={{ width: '4px', height: '16px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px' }}></div>
              <span style={{ fontSize: '.88rem', fontWeight: 700, color: '#1a1a2e' }}>Dispositivos por tipo</span>
            </div>

            {tiposOrdenados.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '.82rem', textAlign: 'center', padding: '1rem' }}>
                No hay datos de tipos registrados
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '.75rem' }}>
                {tiposOrdenados.map(([tipo, count]) => (
                  <div key={tipo} style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '.85rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '.72rem', color: '#64748b', marginBottom: '.3rem', fontWeight: 500 }}>
                      {tipo}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e' }}>{count}</div>
                    <div style={{ marginTop: '.4rem', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '2px',
                        background: 'linear-gradient(135deg, #0492C2, #82EEFD)',
                        width: `${Math.round((count / maxTipo) * 100)}%`
                      }}></div>
                    </div>
                    <div style={{ fontSize: '.68rem', color: '#94a3b8', marginTop: '.3rem' }}>
                      {pct(count)}% del total
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.25rem .75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '16px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px' }}></div>
              <span style={{ fontSize: '.88rem', fontWeight: 700, color: '#1a1a2e' }}>Registros recientes</span>
              <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 9px', borderRadius: '20px' }}>
                últimos 5
              </span>
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
                    <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '.82rem' }}>{d.nombre}</div>
                      </td>
                      <td style={tdStyle}>{d.tipo || 'N/A'}</td>
                      <td style={tdStyle}>{d.marca || 'N/A'}</td>
                      <td style={tdStyle}>{d.ubicacion || 'N/A'}</td>
                      <td style={tdStyle}>
                        <span style={getBadgeStyle(d.estado)}>{d.estado}</span>
                      </td>
                    </tr>
                  ))}
                  {dispositivos.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '.82rem' }}>
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
