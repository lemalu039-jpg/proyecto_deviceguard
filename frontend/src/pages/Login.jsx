import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [vista, setVista] = useState('login');
  const [panelSlide, setPanelSlide] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '', confirmar: '', rol: 'usuario' });
  const [errorReg, setErrorReg] = useState('');
  const [exitoReg, setExitoReg] = useState('');
  const [loadingReg, setLoadingReg] = useState(false);

  const irRegistro = () => {
    setPanelSlide(true);
    setTimeout(() => setVista('registro'), 280);
  };

  const irLogin = () => {
    setPanelSlide(false);
    setTimeout(() => setVista('login'), 280);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    if (!email || !password) { setErrorLogin('Por favor ingresa tu correo y contraseña.'); return; }
    setLoadingLogin(true);
    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/login', {
        correo: email,
        contrasena: password
      });
      if (response.data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        onLogin(response.data.usuario);
      }
    } catch (err) {
      if (err.response) setErrorLogin(err.response.data.error || 'Error al iniciar sesión');
      else if (err.request) setErrorLogin('No se pudo conectar con el servidor.');
      else setErrorLogin('Error al procesar la solicitud');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setErrorReg('');
    setExitoReg('');
    if (!form.nombre || !form.correo || !form.contrasena || !form.confirmar) {
      setErrorReg('Por favor completa todos los campos.'); return;
    }
    if (form.contrasena !== form.confirmar) {
      setErrorReg('Las contraseñas no coinciden.'); return;
    }
    if (form.contrasena.length < 6) {
      setErrorReg('La contraseña debe tener al menos 6 caracteres.'); return;
    }
    setLoadingReg(true);
    try {
      await axios.post('http://localhost:5000/api/usuarios/registro', {
        nombre: form.nombre,
        correo: form.correo,
        contrasena: form.contrasena,
        rol: form.rol
      });
      setExitoReg('¡Cuenta creada! Redirigiendo al login...');
      setTimeout(() => {
        setForm({ nombre: '', correo: '', contrasena: '', confirmar: '', rol: 'usuario' });
        setExitoReg('');
        irLogin();
      }, 2000);
    } catch (err) {
      if (err.response) setErrorReg(err.response.data.error || 'Error al registrar usuario');
      else if (err.request) setErrorReg('No se pudo conectar con el servidor.');
      else setErrorReg('Error al procesar la solicitud');
    } finally {
      setLoadingReg(false);
    }
  };

  const s = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5'
    },
    card: {
      background: '#fff',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '780px',
      minHeight: '480px',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(26,26,46,0.15)'
    },
  
    formWrap: {
      position: 'absolute',
      top: 0,
      left: panelSlide ? '50%' : '0%',
      width: '50%',
      height: '100%',
      padding: '2rem 1.75rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: '#fff',
      transition: 'left .55s cubic-bezier(.77,0,.18,1)',
      zIndex: 1,
      overflowY: 'auto'
    },
 
    panel: {
      position: 'absolute',
      top: 0,
      left: panelSlide ? '0%' : '50%',
      width: '50%',
      height: '100%',
      background: 'linear-gradient(135deg,#82EEFD,#151E3D,#0492C2)',
      borderRadius: '60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 2rem',
      textAlign: 'center',
      transition: 'left .55s cubic-bezier(.77,0,.18,1)',
      zIndex: 10
    },
    title: { fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', textAlign: 'center', marginBottom: '1.1rem' },
    field: { display: 'flex', alignItems: 'center', background: '#f5f5f5', border: '1.5px solid #e2e2e2', borderRadius: '8px', marginBottom: '.7rem', padding: '0 .7rem' },
    input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '.55rem .45rem', fontSize: '.83rem', color: '#1a1a2e' },
    select: { flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '.55rem .45rem', fontSize: '.83rem', color: '#1a1a2e', cursor: 'pointer' },
    icon: { fontSize: '13px', color: '#9e9e9e', width: '16px', textAlign: 'center', flexShrink: 0 },
    btnMain: { width: '100%', padding: '.63rem', background: 'linear-gradient(135deg,#52B2BF,#0A1172)', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '.88rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '.4px', marginTop: '.1rem' },
    btnOff: { width: '100%', padding: '.63rem', background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '.88rem', fontWeight: 700, cursor: 'not-allowed', marginTop: '.1rem' },
    alertErr: { background: '#fce4ec', border: '1px solid #f48fb1', color: '#c62828', borderRadius: '6px', padding: '.55rem .75rem', fontSize: '.78rem', marginBottom: '.7rem' },
    alertOk: { background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#1b5e20', borderRadius: '6px', padding: '.55rem .75rem', fontSize: '.78rem', marginBottom: '.7rem' },
    forgot: { textAlign: 'right', fontSize: '.72rem', color: '#E91E63', cursor: 'pointer', marginTop: '-.35rem', marginBottom: '.75rem', fontWeight: 500 },
    row2: { display: 'flex', gap: '8px' },
    iconWrap: { width: '44px', height: '44px', background: '#e8eaf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .8rem' },
    panelLogo: { fontSize: '.73rem', fontWeight: 700, letterSpacing: '1.5px', color: '#52b2b7', marginBottom: '.55rem', textTransform: 'uppercase' },
    panelBadge: { display: 'inline-block', background: '#52b2b7', color: '#fff', fontSize: '.61rem', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', letterSpacing: '.5px', marginBottom: '.85rem', textTransform: 'uppercase' },
    panelTitle: { color: '#fff', fontSize: '1.35rem', fontWeight: 700, marginBottom: '.4rem' },
    panelSub: { color: 'rgba(255,255,255,.75)', fontSize: '.79rem', marginBottom: '1.4rem', lineHeight: 1.6 },
    btnOutline: { padding: '.52rem 1.75rem', background: 'transparent', border: '2px solid #fff', borderRadius: '30px', color: '#fff', fontSize: '.84rem', fontWeight: 600, cursor: 'pointer' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

     
        <div style={s.formWrap}>
          {vista === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={s.iconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3949AB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div style={s.title}>Iniciar sesión</div>
              {errorLogin && <div style={s.alertErr}>{errorLogin}</div>}
              <div style={s.field}>
                <span style={s.icon}>✉</span>
                <input style={s.input} type="email" placeholder="correo@deviceguard.com"
                  value={email} onChange={e => setEmail(e.target.value)} disabled={loadingLogin} />
              </div>
              <div style={s.field}>
                <span style={s.icon}>🔒</span>
                <input style={s.input} type="password" placeholder="••••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} disabled={loadingLogin} />
              </div>
              <div style={s.forgot}>¿Olvidaste tu contraseña?</div>
              <button type="submit" style={loadingLogin ? s.btnOff : s.btnMain} disabled={loadingLogin}>
                {loadingLogin ? 'Iniciando sesión...' : 'Inicia sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegistro}>
              <div style={s.title}>Crear cuenta</div>
              {errorReg && <div style={s.alertErr}>{errorReg}</div>}
              {exitoReg && <div style={s.alertOk}>{exitoReg}</div>}
              <div style={s.row2}>
                <div style={{ flex: 1 }}>
                  <div style={s.field}>
                    <span style={s.icon}>👤</span>
                    <input style={s.input} type="text" placeholder="Nombre completo"
                      value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} disabled={loadingReg} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.field}>
                    <span style={s.icon}>⚙</span>
                    <select style={s.select} value={form.rol}
                      onChange={e => setForm({ ...form, rol: e.target.value })} disabled={loadingReg}>
                      <option value="usuario">Usuario</option>
                      <option value="tecnico">Técnico</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={s.field}>
                <span style={s.icon}>✉</span>
                <input style={s.input} type="email" placeholder="Correo electrónico"
                  value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} disabled={loadingReg} />
              </div>
              <div style={s.field}>
                <span style={s.icon}>🔒</span>
                <input style={s.input} type="password" placeholder="Contraseña (mín. 6 caracteres)"
                  value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} disabled={loadingReg} />
              </div>
              <div style={s.field}>
                <span style={s.icon}>🔒</span>
                <input style={s.input} type="password" placeholder="Confirmar contraseña"
                  value={form.confirmar} onChange={e => setForm({ ...form, confirmar: e.target.value })} disabled={loadingReg} />
              </div>
              <button type="submit" style={loadingReg ? s.btnOff : s.btnMain} disabled={loadingReg}>
                {loadingReg ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          )}
        </div>

      
        <div style={s.panel}>
          {vista === 'login' ? (
            <>
              <div style={s.panelLogo}>DeviceGuard</div>
              <div style={s.panelBadge}>SENA</div>
              <div style={s.panelTitle}>¡Bienvenido!</div>
              <div style={s.panelSub}>¿No tienes cuenta aún?<br />Regístrate y comienza<br />a gestionar dispositivos</div>
              <button style={s.btnOutline} onClick={irRegistro} type="button">Registrarse</button>
            </>
          ) : (
            <>
              <div style={s.panelLogo}>DeviceGuard</div>
              <div style={s.panelBadge}>SENA</div>
              <div style={s.panelTitle}>¡Bienvenido de nuevo!</div>
              <div style={s.panelSub}>¿Ya tienes cuenta?<br />Inicia sesión para<br />continuar</div>
              <button style={s.btnOutline} onClick={irLogin} type="button">Iniciar sesión</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Login;
