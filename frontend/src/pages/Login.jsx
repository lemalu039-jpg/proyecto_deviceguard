import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/login', {
        correo: email,
        contrasena: password
      });

      if (response.data.usuario) {
        // Guardar información del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        onLogin(response.data.usuario);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Error al iniciar sesión');
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        setError('Error al procesar la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '64px', height: '64px', background: '#f8fafc',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem'
          }}>
            🔒
          </div>
        </div>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 700 }}>
          Registrar usuario autorizado
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Por favor ingresa tu correo y contraseña
        </p>
        
        {error && <div style={{ 
          color: '#ef4444', 
          marginBottom: '1rem', 
          fontSize: '0.875rem',
          padding: '0.75rem',
          background: '#fee2e2',
          borderRadius: '0.375rem',
          border: '1px solid #fecaca'
        }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label>Correo Electrónico:</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="nombre.apellido@deviceguard.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label>Contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 400 }}>
              <input type="checkbox" /> Recuerdame
            </label>
            <a href="#" style={{ color: '#d946ef', textDecoration: 'none', fontWeight: 500 }}>Olvidaste la Contraseña?</a>
          </div>
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{
              width: '100%', 
              background: loading ? '#64748b' : '#1e3a8a', 
              color: 'white',
              padding: '0.75rem', 
              fontWeight: 600, 
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Inicia sesion'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
