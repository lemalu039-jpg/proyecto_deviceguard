import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import correo from '../assets/icons/correo.svg';
import candado from '../assets/icons/candado.svg';
import cerrarsesion from '../assets/icons/cerrarsesion.svg';

function Navbar({ onLogout }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('usuario'));
    setUsuario(user);
  }, []);

  return (
    <header style={{
      background: 'var(--bg-card)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border)',
      position: 'relative',
      zIndex: 10,
      flexWrap: 'wrap',
      gap: '1rem'
    }}>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>

        {/* BOTÓN COSMIC */}
        <label className="cosmic-toggle">
          <input type="checkbox" className="l" checked={darkMode} onChange={toggleTheme} />
          <div className="slider">
            <div className="cosmos"></div>
            <div className="toggle-orb">
              <div className="inner-orb"></div>
              <div className="ring"></div>
            </div>
            <div className="energy-line"></div>
            <div className="energy-line"></div>
            <div className="energy-line"></div>
            <div className="particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
          </div>
        </label>

        {/* PERFIL */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            cursor: 'pointer', borderLeft: '1px solid var(--border)',
            paddingLeft: '1.5rem', position: 'relative', minWidth: 'fit-content'
          }}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <div style={{ textAlign: 'right', display: window.innerWidth < 480 ? 'none' : 'block' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{usuario?.nombre}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{usuario?.rol}</p>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</span>

          {menuAbierto && (
            <>
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} onClick={() => setMenuAbierto(false)} />
              <div style={{
                position: 'absolute', top: '60px', right: '0',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '10px', width: '180px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.15)', zIndex: 9999
              }}>
                <p style={{ padding: '8px', cursor: 'pointer', margin: 0 }}
                  onClick={() => { navigate('/cambiar-correo'); setMenuAbierto(false); }}>
                  <img src={correo} alt="" style={{ width: '14px', marginRight: '6px' }} />
                  Cambiar correo
                </p>
                <p style={{ padding: '8px', cursor: 'pointer', margin: 0 }}
                  onClick={() => { navigate('/cambiar-contrasena'); setMenuAbierto(false); }}>
                  <img src={candado} alt="" style={{ width: '16px', marginRight: '6px' }} />
                  Cambiar contraseña
                </p>
                <hr style={{ borderColor: 'var(--border)' }} />
                <p style={{ padding: '8px', cursor: 'pointer', color: '#ef4444', margin: 0 }}
                  onClick={() => { onLogout(); setMenuAbierto(false); }}>
                  <img src={cerrarsesion} alt="" style={{ width: '16px', marginRight: '6px' }} />
                  Cerrar sesión
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
