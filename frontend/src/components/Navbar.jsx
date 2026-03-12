import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Navbar({ onLogout }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const location = useLocation();
  const [usuario, setUsuario] = useState(null)
  const navigate = useNavigate();
  

  useEffect(() =>{
    const user = JSON.parse(localStorage.getItem("usuario"))
    setUsuario(user)
  }, [])

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
      
      

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
        
      

       

        {/* Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem', position: 'relative' }} onClick={() => setMenuAbierto(!menuAbierto)}>
          <div style={{ textAlign: 'right'}}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)'}}>{usuario?.nombre}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{usuario?.rol}</p>
          </div>
          
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</span>
        
        {menuAbierto && (
  <div style={{
    position: 'absolute',
    top: '60px',
    right: '30px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    width: '180px',
    boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
  }}>
    
    <p style={{ padding: '8px', cursor: 'pointer' }}>👤 Perfil</p>
    <p style={{ padding: '8px', cursor: 'pointer' }} onClick={() => navigate("/cambiar-correo")}>📧 Cambiar correo</p>
    <p style={{ padding: '8px', cursor: 'pointer' }}>🔒 Cambiar contraseña</p>
    <hr/>
    <p style={{ padding: '8px', cursor: 'pointer', color: 'red' }} onClick={onLogout}>🚪 Cerrar sesión</p>

  </div>
)}
</div>
      </div>
    </header>
  );
}

export default Navbar;
