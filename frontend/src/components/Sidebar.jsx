import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '⏱️' },
    { path: '/dispositivos', label: 'Dispositivos', icon: '💻' },
    { path: '/favoritos', label: 'Favoritos', icon: '❤️' },
    { path: '/correo', label: 'Correo', icon: '✉️' },
    { path: '/registro', label: 'Registro de Dispositivos', icon: '📋' },
    { path: '/rutas', label: 'Consulta con Filtros', icon: '🔍' },
  ];

  const pageItems = [
    { path: '/reportes', label: 'Generar Reportes', icon: '📄' },
    { path: '/prestamos', label: 'Registrar Salida', icon: '📤' },
    { path: '/calendario', label: 'Calendario', icon: '📅' },
    { path: '/estadisticas', label: 'Estadísticas', icon: '📉' },
    { path: '/usuarios', label: 'Equipo', icon: '👥' },
    { path: '/mantenimiento', label: 'Notificaciones', icon: '🔔' },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'white',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', background: '#fce2e5',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
           <span style={{color: '#e84393', fontWeight: 'bold', fontSize: '1.2rem'}}>🔒</span>
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>DeviceGuard</h1>
      </div>
      
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem 0' }}>
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
                color: isActive ? 'white' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-dark)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem'
              })}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1.5rem 1.5rem 0.75rem 1.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#b2bec3', letterSpacing: '1px' }}>PÁGINAS</span>
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
                color: isActive ? 'white' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-dark)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem'
              })}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
         <button style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            fontWeight: 500, cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius-sm)'
          }}>
            <span style={{ fontSize: '1.1rem' }}>⚙️</span> Ajustes
        </button>
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            fontWeight: 500, cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius-sm)'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🚪</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
