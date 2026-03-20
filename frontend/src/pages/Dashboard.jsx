import React, { useEffect, useState } from 'react';
import { getDispositivos, getUsuarios } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalDispositivos: 0,
    disponibles: 0,
    enPrestamo: 0,
    enMantenimiento: 0,
    inactivos: 0,
    usuarios: 0
  });

  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, usuariosRes] = await Promise.all([
          getDispositivos(),
          getUsuarios()
        ]);

        const allDevices = devicesRes.data;

        setStats({
          totalDispositivos: allDevices.length,
          disponibles: allDevices.filter(d => d.estado === 'Disponible').length,
          enPrestamo: allDevices.filter(d => d.estado === 'En Prestamo').length,
          enMantenimiento: allDevices.filter(d => d.estado === 'En Mantenimiento').length,
          inactivos: allDevices.filter(d => d.estado === 'Inactivo').length,
          usuarios: usuariosRes.data.length
        });

        setDispositivos(allDevices.slice(0, 5));

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
      case 'Disponible':        return { ...base, background: '#dcfce7', color: '#15803d' };
      case 'En Prestamo':       return { ...base, background: '#fef9c3', color: '#854d0e' };
      case 'En Mantenimiento':  return { ...base, background: '#fee2e2', color: '#b91c1c' };
      default:                  return { ...base, background: '#f1f5f9', color: '#64748b' };
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
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    whiteSpace: 'nowrap'
  };

  const tdStyle = {
    padding: '.65rem .85rem',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    verticalAlign: 'middle'
  };

  const IconoTotal = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0492C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  );


  const IconoDisponible = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );

  
  const IconoPrestamo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );


  const IconoMantenimiento = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );

 
  const IconoInactivo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="10" y1="15" x2="10" y2="9"/>
      <line x1="14" y1="15" x2="14" y2="9"/>
    </svg>
  );

  const cards = [
    {
      label: 'Total equipos',
      value: stats.totalDispositivos,
      accentColor: 'linear-gradient(135deg, #0492C2, #82EEFD)',
      textColor: '#0492C2',
      iconBg: 'rgba(4, 146, 194, .1)',
      icono: <IconoTotal />,
      badge: null,
      sub: `${stats.usuarios} usuarios registrados`,
      subColor: '#10b981'
    },
    {
      label: 'Disponibles',
      value: stats.disponibles,
      accentColor: '#15803d',
      textColor: '#15803d',
      iconBg: 'rgba(21, 128, 61, .1)',
      icono: <IconoDisponible />,
      badge: { label: 'Disponible', bg: '#dcfce7', color: '#15803d' }
    },
    {
      label: 'En préstamo',
      value: stats.enPrestamo,
      accentColor: '#854d0e',
      textColor: '#854d0e',
      iconBg: 'rgba(133, 77, 14, .1)',
      icono: <IconoPrestamo />,
      badge: { label: 'En Prestamo', bg: '#fef9c3', color: '#854d0e' }
    },
    {
      label: 'En mantenimiento',
      value: stats.enMantenimiento,
      accentColor: '#b91c1c',
      textColor: '#b91c1c',
      iconBg: 'rgba(185, 28, 28, .1)',
      icono: <IconoMantenimiento />,
      badge: { label: 'En Mantenimiento', bg: '#fee2e2', color: '#b91c1c' }
    },
    {
      label: 'Inactivos',
      value: stats.inactivos,
      accentColor: '#64748b',
      textColor: '#64748b',
      iconBg: 'rgba(100, 116, 139, .1)',
      icono: <IconoInactivo />,
      badge: { label: 'Inactivo', bg: '#f1f5f9', color: '#64748b' }
    }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.6rem', color: 'var(--text-main)' }}>
        Dashboard
      </h1>

      {loading ? (
        <p>Cargando información...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.1rem 1rem 1rem 1.3rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '4px',
                height: '100%',
                background: card.accentColor,
                borderRadius: '12px 0 0 12px'
              }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '.8rem', margin: 0 }}>
                  {card.label}
                </p>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {card.icono}
                </div>
              </div>

              <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 .65rem 0', color: card.textColor }}>
                {card.value}
              </h2>

              <div>
                {card.badge ? (
                  <span style={{
                    display: 'inline-block',
                    background: card.badge.bg,
                    color: card.badge.color,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '.65rem'
                  }}>
                    {card.badge.label}
                  </span>
                ) : (
                  <p style={{ fontSize: '.75rem', margin: 0, color: card.subColor, fontWeight: 600 }}>
                    {card.sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
        Lista de dispositivos recientes
      </h3>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.81rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>Imagen</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Ubicación</th>
                <th style={thStyle}>Serial</th>
                <th style={thStyle}>Fecha registro</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {dispositivos.map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={tdStyle}>
                    <div style={{
                   width: '42px',
                   height: '42px',
                   borderRadius: '8px',
                   background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                   overflow: 'hidden',
                   flexShrink: 0
            }}>
                   {d.archivo
                  ? <img
                    src={`http://localhost:5000/uploads/${d.archivo}`}
                   alt={d.nombre}
                   style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                   : <span style={{ fontSize: '.6rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>N/A</span>
                  }
                   </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '.82rem' }}>{d.nombre}</div>
                    <div style={{ fontSize: '.71rem', color: '#94a3b8', marginTop: '1px' }}>{d.tipo}</div>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '.8rem', color: '#64748b' }}>{d.ubicacion || 'N/A'}</td>
                  <td style={{ ...tdStyle, fontSize: '.8rem', color: '#64748b', fontFamily: 'monospace' }}>{d.serial}</td>
                  <td style={{ ...tdStyle, fontSize: '.8rem', color: '#64748b' }}>{formatFecha(d.fecha_registro)}</td>
                  <td style={tdStyle}>
                    <span style={getBadgeStyle(d.estado)}>{d.estado}</span>
                  </td>
                </tr>
              ))}
              {dispositivos.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '.82rem' }}>
                    No hay dispositivos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
