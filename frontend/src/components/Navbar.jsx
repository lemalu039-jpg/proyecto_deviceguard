import React from 'react';
import { useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  // Helper to format the current route name
  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header style={{
      background: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
          ☰
        </button>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar" 
            style={{
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              borderRadius: '999px',
              border: '1px solid var(--border)',
              background: '#f8fafc',
              width: '300px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Notificaciones */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.25rem', color: '#636e72' }}>🔔</span>
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: 'var(--danger)', color: 'white',
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', border: '2px solid white'
          }}>6</span>
        </div>

        {/* Idioma */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
           <img src="https://flagcdn.com/w20/co.png" alt="Colombia" style={{ width: '20px', borderRadius: '2px' }} />
           <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Español ﹀</span>
        </div>

        {/* Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>juan perez</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin</p>
          </div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--secondary)', overflow: 'hidden', border: '2px solid #ffeaa7'
          }}>
            <img src="https://cdn-icons-png.flaticon.com/512/6858/6858504.png" alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</span>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
