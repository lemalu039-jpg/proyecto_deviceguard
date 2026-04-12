import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import dashboard_ from '../assets/icons/dashboard_.svg';
import dispositivos_ from '../assets/icons/dispositivos_.svg';
import favoritos_ from '../assets/icons/favoritos_.svg';
import correo_ from '../assets/icons/correo_.svg';
import registrodispositivos_ from '../assets/icons/registrodispositivos_.svg';
import consultafiltros_ from '../assets/icons/consultafiltros_.svg';
import generar_reportes_ from '../assets/icons/generar_reportes_.svg';
import registrarsalida_ from '../assets/icons/registrarsalida_.svg';
import calendario_ from '../assets/icons/calendario_.svg';
import estadisticas_ from '../assets/icons/estadisticas_.svg';
import equipo_ from '../assets/icons/equipo_.svg';
import notificaciones_ from '../assets/icons/notificaciones_.svg';
import ajustes from '../assets/icons/ajustes.svg';
import logo from '../assets/icons/logo-deviceguard.svg';

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: dashboard_ },
    { path: '/dispositivos', label: 'Registro de Dispositivos', icon: dispositivos_ },
    { path: '/correo', label: 'Correo', icon: correo_ },
   
    { path: '/consultarfiltros', label: 'Consulta con Filtros', icon: consultafiltros_ },
  ];

  const pageItems = [
    { path: '/reportes', label: 'Generar Reportes', icon: generar_reportes_ },
    { path: '/registrarsalida', label: 'Registrar Salida', icon: registrarsalida_ },
    { path: '/calendario', label: 'Calendario', icon: calendario_ },
    { path: '/estadisticas', label: 'Estadísticas', icon: estadisticas_ },
    { path: '/equipo', label: 'Equipo', icon: equipo_ },
    { path: '/gestion', label: 'Gestión de mantenimiento', icon: ajustes },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
           <span style={{
            color: '#e84393', 
            fontWeight: 'bold', 
            fontSize: '1.2rem'}}></span>
        </div>
        <h1 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 700, 
          margin: 0, color: 'var(--text-main)', 
          letterSpacing: '-0.5px' }}>DeviceGuard</h1>
      </div>
      
      <div style={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        padding: '1rem 0' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? 'active-nav-link' : ''}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem'
              })}
            >
              {({ isActive }) => (
                <>
                  <img
                    src={item.icon}
                    alt={item.label}
                    style={{
                      width: '35px',
                      height: '22px',
                      objectFit: 'contain',
                      filter: isActive ? 'brightness(0) invert(1)' : 'none'
                    }}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1.5rem 1.5rem 0.75rem 1.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px' }}>PÁGINAS</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
          {pageItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem'
              })}
            >
              {({ isActive }) => (
                <>
                  <img
                    src={item.icon}
                    alt={item.label}
                    style={{
                      width: '35px',
                      height: '22px',
                      objectFit: 'contain',
                      filter: isActive ? 'brightness(0) invert(1)' : 'none'
                    }}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
         <button style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '0.75rem 1rem',
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-muted)',
            fontWeight: 500, 
            cursor: 'pointer', 
            textAlign: 'left', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <span style={{ fontSize: '1.1rem' }}><img src={ajustes} alt="ajustes" style={{ width: "16px", marginRight: "6px" }} /></span> Ajustes
        </button>
        
      </div>
    </aside>
  );
}

export default Sidebar;
