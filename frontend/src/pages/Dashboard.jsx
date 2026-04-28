import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDispositivos, getUsuarios } from '../services/api';
import { estadosDispositivo } from "../ejemplo/generador2";
import Pagination from '../components/Pagination';

function Dashboard() {
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
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [imagenActiva, setImagenActiva] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, usuariosRes] = await Promise.all([
          getDispositivos(),
          getUsuarios()
        ]);
        const allDevices = devicesRes.data;
        
        const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
        const dispositivos = usuarioActual.rol === 'usuario'
          ? allDevices.filter(d => d.usuario_id === usuarioActual.id)
          : allDevices;

        setStats({
          totalDispositivos: dispositivos.length,
          listoparaEntrega:     dispositivos.filter(d => d.estado === 'Listo para Entrega').length,
          enRevision:      dispositivos.filter(d => d.estado === 'En Revision').length,
          enMantenimiento: dispositivos.filter(d => d.estado === 'En Mantenimiento').length,
          entregado:      dispositivos.filter(d => d.estado === 'Entregado').length,
          usuarios:        usuariosRes.data.length,
          totalMantenimientos: parseInt(localStorage.getItem('totalReportes') || '0')
        });
        setDispositivos(dispositivos);
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
      case 'Listo para Entrega':       return { ...base, background: '#fcfbdc', color: '#dacd1c' };
      case 'En Revision':      return { ...base, background: '#f3e8ff', color: '#7e22ce' };
      case 'En Mantenimiento': return { ...base, background: '#ffedd5', color: '#c2410c' };
      case 'Entregado':     return { ...base, background: '#f3fef2', color: '#15803d' };
      default:                 return { ...base, background: 'var(--input-bg)', color: 'var(--text-muted)' };
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
    padding: '.65rem .85rem',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-main)',
    verticalAlign: 'middle'
  };

  
  const IconoTotal = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0492C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  );
  const IconoListoparaentrega = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dacd1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
  const IconoRevision = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  );
  const IconoMantenimiento = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
  const IconoEntregado = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
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
      label: 'Listo para Entrega',
      value: stats.listoparaEntrega,
      accentColor: '#dacd1c',
      textColor: '#dacd1c',
      iconBg: 'rgba(218, 205, 24, 0.13)',
      icono: <IconoListoparaentrega />,
      badge: { label: 'Listo para Entrega', bg: '#fcfbdc', color: '#dacd1c' }
    },
    {
      label: 'En revisión',
      value: stats.enRevision,
      accentColor: '#7e22ce',
      textColor: '#7e22ce',
      iconBg: 'rgba(126, 34, 206, .1)',
      icono: <IconoRevision />,
      badge: { label: 'En Revision', bg: '#f3e8ff', color: '#7e22ce' }
    },
    
    {
      label: 'En mantenimiento',
      value: stats.enMantenimiento,
      accentColor: '#c2410c',
      textColor: '#c2410c',
      iconBg: 'rgba(194, 65, 12, .1)',
      icono: <IconoMantenimiento />,
      badge: { label: 'En Mantenimiento', bg: '#ffedd5', color: '#c2410c' }
    },
    {
      label: 'Entregado',
      value: stats.entregado,
      accentColor: '#15803d',
      textColor: '#15803d',
      iconBg: 'rgba(19, 112, 15, 0.1)',
      icono: <IconoEntregado />,
      badge: { label: 'Entregado', bg: '#f3fef2', color: '#15803d' }
    },
    {
      label: 'Total reportes',
      value: stats.totalMantenimientos,
      accentColor: '#0369a1',
      textColor: '#0369a1',
      iconBg: 'rgba(3, 105, 161, 0.1)',
      icono: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
      ),
      badge: { label: 'Reportes enviados', bg: '#e0f2fe', color: '#0369a1' }
    },
  ];


  const cardW = 'calc(25% - 0.75rem)';

  const renderCard = (card, i) => (
    <div key={i} className={`card-3d animate-fade-in-up delay-${(i + 1) * 100}`} style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      padding: '1.1rem 1rem 1rem 1.3rem',
      position: 'relative',
      overflow: 'hidden',
      flex: `0 1 ${cardW}`
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: '4px', height: '100%',
        background: card.accentColor,
        borderRadius: '12px 0 0 12px'
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '.8rem', margin: 0 }}>
          {card.label}
        </p>
        <div style={{
          width: '34px', height: '34px', borderRadius: '9px',
          background: card.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
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
            background: card.badge.bg, color: card.badge.color,
            padding: '2px 8px', borderRadius: '20px',
            fontWeight: 700, fontSize: '.65rem'
          }}>
            {card.badge.label}
          </span>
        ) : (
          <p style={{ fontSize: '.75rem', margin: 0, color: card.subColor, fontWeight: 600 }}>
            {JSON.parse(localStorage.getItem('usuario')||'{}').rol === 'usuario' ? null : card.sub}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.6rem', color: 'var(--text-main)' }}>Inicio</h1>

      {loading ? (
        <p>Cargando información...</p>
      ) : (
        <div style={{ marginBottom: '2rem' }}>

          <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'nowrap',
         overflowX: 'auto'   
          }}>
          {cards
            .filter(card => !(card.label === 'Total reportes' && JSON.parse(localStorage.getItem('usuario') || '{}').rol === 'usuario'))
            .map((card, i) => renderCard(card, i))}
         </div>

        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ width: '4px', height: '18px', background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '2px', flexShrink: 0 }}></div>
        <span style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Lista de dispositivos</span>
        <input
          type="text"
          placeholder="Buscar nombre, serial, ubicación..."
          value={filtroBusqueda}
          onChange={e => { setFiltroBusqueda(e.target.value); setCurrentPage(1); }}
          style={{ flex: 1, minWidth: '180px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none' }}
        />
        <select
          value={filtroEstado}
          onChange={e => { setFiltroEstado(e.target.value); setCurrentPage(1); }}
          style={{ padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}
        >
          <option value="">Todos los estados</option>
          <option value="En Revision">En Revision</option>
          <option value="En Mantenimiento">En Mantenimiento</option>
          <option value="Listo para Entrega">Listo para Entrega</option>
          <option value="Entregado">Entregado</option>
        </select>
        {(filtroEstado || filtroBusqueda) && (
          <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda(''); setCurrentPage(1); }} style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            Limpiar
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.81rem' }}>
            <thead>
              <tr style={{ background: 'var(--table-head)', borderBottom: '2px solid var(--border)' }}>
                <th style={thStyle}>Imagen</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Ubicación</th>
                <th style={thStyle}>Serial</th>
                <th style={thStyle}>Fecha registro</th>
                <th style={thStyle}>Estado</th>
                {JSON.parse(localStorage.getItem('usuario')||'{}').rol==='super_admin' && <th style={thStyle}>Registrado por</th>}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filtrados = dispositivos.filter(d => {
                  const texto = `${d.nombre} ${d.serial} ${d.ubicacion}`.toLowerCase();
                  const okBusqueda = !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
                  const okEstado = !filtroEstado || d.estado === filtroEstado;
                  return okBusqueda && okEstado;
                });                return filtrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--table-stripe)' }}>
                  <td style={tdStyle}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '8px',
                      background: 'var(--input-bg)', border: '1px solid var(--border)',
                      overflow: 'hidden', flexShrink: 0
                    }}>
                      {d.archivo
                       ? <img 
                        src={`http://localhost:5000/uploads/${d.archivo}`} 
                        alt={d.nombre}
                        onClick={() => setImagenActiva(`http://localhost:5000/uploads/${d.archivo}`)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',cursor: 'pointer'}} />
                        : <span style={{ fontSize: '.6rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>N/A</span>
                      }
                    </div>
                  </td>
                  <td onClick={() => navigate(`/historial/${d.id}`)} style={{...tdStyle, cursor: 'pointer'}} className="hover-link">
                    <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '.82rem', textDecoration: 'underline dotted' }}>{d.nombre}</div>
                    <div style={{ fontSize: '.71rem', color: 'var(--text-muted)', marginTop: '1px' }}>{d.tipo}</div>
                  </td>
                  <td onClick={() => navigate(`/historial/${d.id}`)} style={{ ...tdStyle, fontSize: '.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="hover-link">{d.ubicacion || 'N/A'}</td>
                  <td onClick={() => navigate(`/historial/${d.id}`)} style={{ ...tdStyle, fontSize: '.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', cursor: 'pointer' }} className="hover-link">{d.serial}</td>
                  <td onClick={() => navigate(`/historial/${d.id}`)} style={{ ...tdStyle, fontSize: '.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} className="hover-link">
                    {formatFecha(d.fecha_registro)}
                    {d.hora_registro && (
                      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {d.hora_registro}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={getBadgeStyle(d.estado)}>{d.estado}</span>
                  </td>
                  {JSON.parse(localStorage.getItem('usuario')||'{}').rol==='super_admin' && (
                    <td style={{ ...tdStyle, fontSize: '.78rem', color: 'var(--text-muted)' }}>
                      {d.registrado_por || '—'}
                    </td>
                  )}
                </tr>
                ));
              })()}
              {dispositivos.filter(d => {
                const texto = `${d.nombre} ${d.serial} ${d.ubicacion}`.toLowerCase();
                return (!filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase())) && (!filtroEstado || d.estado === filtroEstado);
              }).length === 0 && (                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '.82rem' }}>
                    No hay dispositivos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        totalItems={(filtroEstado ? dispositivos.filter(d => d.estado === filtroEstado) : dispositivos).length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      {imagenActiva && (
  <div 
    onClick={() => setImagenActiva(null)}
    style={{position: 'fixed',top: 0,left: 0,width: '100%',height: '100%',background: 'rgba(0,0,0,0.85)',display: 'flex',alignItems: 'center',justifyContent: 'center',zIndex: 9999,backdropFilter: 'blur(6px)'}}>
    <img 
      src={imagenActiva}
      alt="preview"
      style={{maxWidth: '90%',maxHeight: '90%',borderRadius: '12px',boxShadow: '0 30px 80px rgba(0,0,0,0.7)'}}/>
  </div>
)}
    </div>
  );
}

export default Dashboard;
