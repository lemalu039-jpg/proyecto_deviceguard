import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import axios from 'axios';
import './css/Login.css';
import logo from '../assets/icons/logo-deviceguard.svg';  
import candado from '../assets/icons/candado.svg';
import correo from '../assets/icons/correo.svg';
import usuario from '../assets/icons/usuario.svg';

function Login({ onLogin }) {
  const { t } = useLanguage();
  const [vista, setVista] = useState('login');
  const [panelSlide, setPanelSlide] = useState(false);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setVista('restablecer');
      setPanelSlide(false);
    }

    const originalTheme = document.body.getAttribute('data-theme');
    document.body.setAttribute('data-theme', 'light');
    
    return () => {
      if (originalTheme) {
        document.body.setAttribute('data-theme', originalTheme);
      }
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '', confirmar: '', rol: 'usuario' });
  const [errorReg, setErrorReg] = useState('');
  const [exitoReg, setExitoReg] = useState('');
  const [loadingReg, setLoadingReg] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estados para Recuperar Contraseña
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [errorRecuperar, setErrorRecuperar] = useState('');
  const [exitoRecuperar, setExitoRecuperar] = useState('');
  const [loadingRecuperar, setLoadingRecuperar] = useState(false);

  // Estados para Restablecer Contraseña
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarNueva, setConfirmarNueva] = useState('');
  const [errorRestablecer, setErrorRestablecer] = useState('');
  const [exitoRestablecer, setExitoRestablecer] = useState('');
  const [loadingRestablecer, setLoadingRestablecer] = useState(false);  const irRegistro = () => {
    setPanelSlide(true);
    setTimeout(() => setVista('registro'), 280);
  };

  const irLogin = () => {
    setPanelSlide(false);
    setTimeout(() => setVista('login'), 280);
  };

  const irRecuperar = () => {
    setPanelSlide(false);
    setTimeout(() => setVista('recuperar'), 280);
  };

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setErrorRecuperar('');
    setExitoRecuperar('');
    if (!emailRecuperar) { setErrorRecuperar('Ingresa tu correo electrónico.'); return; }
    setLoadingRecuperar(true);
    try {
      const res = await axios.post('http://localhost:5000/api/usuarios/recuperar', { correo: emailRecuperar });
      setExitoRecuperar(res.data.message || 'Se han enviado las instrucciones al correo.');
      setTimeout(() => irLogin(), 5000);
    } catch (err) {
      setErrorRecuperar('Error al procesar la solicitud');
    } finally {
      setLoadingRecuperar(false);
    }
  };

  const handleRestablecer = async (e) => {
    e.preventDefault();
    setErrorRestablecer('');
    setExitoRestablecer('');
    if (!nuevaContrasena || !confirmarNueva) { setErrorRestablecer('Completa todos los campos'); return; }
    if (nuevaContrasena !== confirmarNueva) { setErrorRestablecer('Las contraseñas no coinciden'); return; }
    if (nuevaContrasena.length < 6) { setErrorRestablecer('Mínimo 6 caracteres'); return; }
    setLoadingRestablecer(true);
    try {
      const res = await axios.post('http://localhost:5000/api/usuarios/restablecer', { token: resetToken, nuevaContrasena });
      setExitoRestablecer(res.data.message || 'Contraseña actualizada. Redirigiendo...');
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        irLogin();
      }, 3000);
    } catch (err) {
      if (err.response) setErrorRestablecer(err.response.data.error || 'Error al restablecer contraseña');
      else setErrorRestablecer('Error al procesar la solicitud');
    } finally {
      setLoadingRestablecer(false);
    }
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

  const isDark = false; // Siempre modo claro en login

  const s = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? 'var(--bg-main)' : '#f5f5f5'
    },
    card: {
      background: 'var(--bg-card)',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '780px',
      minHeight: '480px',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.6)' : '0 8px 32px rgba(26,26,46,0.15)'
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
      background: 'var(--bg-card)',
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
    title: { fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', textAlign: 'center', marginBottom: '1.1rem' },
    field: {
      display: 'flex', alignItems: 'center',
      background: isDark ? '#1E293B' : '#f5f5f5',
      border: isDark ? '1.5px solid var(--border)' : '1.5px solid #e2e2e2',
      borderRadius: '8px', marginBottom: '.7rem', padding: '0 .7rem'
    },
    input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '.55rem .45rem', fontSize: '.83rem', color: isDark ? '#F8FAFC' : '#1a1a2e' },
    icon: { fontSize: '13px', color: '#9e9e9e', width: '16px', textAlign: 'center', flexShrink: 0 },
    btnMain: { width: '100%', padding: '.63rem', background: 'linear-gradient(135deg,#52B2BF,#0A1172)', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '.88rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '.4px', marginTop: '.1rem' },
    btnOff: { width: '100%', padding: '.63rem', background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '.88rem', fontWeight: 700, cursor: 'not-allowed', marginTop: '.1rem' },
    alertErr: { background: isDark ? '#3b1a1a' : '#fce4ec', border: isDark ? '1px solid #7f2020' : '1px solid #f48fb1', color: isDark ? '#f87171' : '#c62828', borderRadius: '6px', padding: '.55rem .75rem', fontSize: '.78rem', marginBottom: '.7rem' },
    alertOk: { background: isDark ? '#1a3b1a' : '#e8f5e9', border: isDark ? '1px solid #2d6a2d' : '1px solid #a5d6a7', color: isDark ? '#86efac' : '#1b5e20', borderRadius: '6px', padding: '.55rem .75rem', fontSize: '.78rem', marginBottom: '.7rem' },
    forgot: { textAlign: 'right', fontSize: '.72rem', color: '#E91E63', cursor: 'pointer', marginTop: '-.35rem', marginBottom: '.75rem', fontWeight: 500 },
    row2: { display: 'flex', gap: '8px' },
    iconWrap: { width: '90px', height: '90px', background: isDark ? 'var(--input-bg)' : '#e8eaf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
    panelLogo: { fontSize: '.73rem', fontWeight: 700, letterSpacing: '1.5px', color: '#52b2b7', marginBottom: '.55rem', textTransform: 'uppercase' },
    panelBadge: { display: 'inline-block', background: '#52b2b7', color: '#fff', fontSize: '.61rem', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', letterSpacing: '.5px', marginBottom: '.85rem', textTransform: 'uppercase' },
    panelTitle: { color: '#fff', fontSize: '1.35rem', fontWeight: 700, marginBottom: '.4rem' },
    panelSub: { color: 'rgba(255,255,255,.75)', fontSize: '.79rem', marginBottom: '1.4rem', lineHeight: 1.6 },
    btnOutline: { padding: '.52rem 1.75rem', background: 'transparent', border: '2px solid #fff', borderRadius: '30px', color: '#fff', fontSize: '.84rem', fontWeight: 600, cursor: 'pointer' },
  };

  return (
    <div style={s.page} className="login-page">
      <div style={s.card} className="login-card">

     
        <div style={s.formWrap} className="login-form-wrap">
          {vista === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={s.iconWrap} className="login-icon-wrap">
               <img
                   src={logo}
                   alt="DeviceGuard Logo"
                   style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                />
              </div>
              <div style={s.title} className="login-title">{t('login_title')}</div>
              {errorLogin && <div style={s.alertErr} className="login-alert">{errorLogin}</div>}
              <div style={s.field} className="login-field">
                <img src={correo} alt="correo" style={{ width: "16px", marginRight: "6px" }} />
                <input className="login-input" style={s.input} type="email" placeholder={t('login_email_ph')}
                  value={email} onChange={e => setEmail(e.target.value)} disabled={loadingLogin} />
              </div>
              <div style={s.field} className="login-field">
                <img src={candado} alt="password" style={{ width: "16px", marginRight: "6px" }} />
                <input className="login-input" style={s.input} type={mostrarPassword ? "text" : "password"} placeholder={t('login_pass_ph')}
                  value={password} onChange={e => setPassword(e.target.value)} disabled={loadingLogin} />
              </div>
              <div style={s.forgot} className="login-forgot" onClick={irRecuperar}>{t('login_forgot')}</div>
              <button type="submit" style={loadingLogin ? s.btnOff : s.btnMain} className="login-btn" disabled={loadingLogin}>
                {loadingLogin ? t('login_btn_loading') : t('login_btn_login')}
              </button>
            </form>
          ) : vista === 'registro' ? (
            <form onSubmit={handleRegistro}>
              <div style={s.title} className="login-title">{t('login_reg_title')}</div>
              {errorReg && <div style={s.alertErr} className="login-alert">{errorReg}</div>}
              {exitoReg && <div style={s.alertOk} className="login-alert">{exitoReg}</div>}
              <div style={s.row2} className="login-row2">
                <div style={{ flex: 1 }}>
                  <div style={s.field} className="login-field">
                    <img src={usuario} alt="usuario" style={{ width: "14px", marginRight: "6px" }} />
                    <input className="login-input" style={s.input} type="text" placeholder={t('login_reg_name_ph')}
                      value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} disabled={loadingReg} />
                  </div>
                </div>
              </div>
              <div style={s.field} className="login-field">
                <img src={correo} alt="correo" style={{ width: "16px", marginRight: "6px" }} />
                <input className="login-input" style={s.input} type="email" placeholder={t('login_reg_email_ph')}
                  value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} disabled={loadingReg} />
              </div>
              <div style={s.field} className="login-field">
                <img src={candado} alt="password" style={{ width: "16px", marginRight: "6px" }} />
                <input className="login-input" style={s.input} type="password" placeholder={t('login_reg_pass_ph')}
                  value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} disabled={loadingReg} />
              </div>
              <div style={s.field} className="login-field">
                <img src={candado} alt="password" style={{ width: "16px", marginRight: "6px" }} />
                <input className="login-input" style={s.input} type="password" placeholder={t('login_reg_conf_ph')}
                  value={form.confirmar} onChange={e => setForm({ ...form, confirmar: e.target.value })} disabled={loadingReg} />
              </div>
              <button type="submit" style={loadingReg ? s.btnOff : s.btnMain} className="login-btn" disabled={loadingReg}>
                {loadingReg ? t('login_btn_reg_loading') : t('login_btn_reg')}
              </button>
            </form>
          ) : vista === 'recuperar' ? (
            <form onSubmit={handleRecuperar}>
              <div style={s.title} className="login-title">{t('login_rec_title')}</div>
              <p style={{textAlign: 'center', fontSize: '0.85rem', marginBottom: '1rem', color: isDark ? '#cbd5e1' : '#555'}}>
                {t('login_rec_sub')}
              </p>
              {errorRecuperar && <div style={s.alertErr} className="login-alert">{errorRecuperar}</div>}
              {exitoRecuperar && <div style={s.alertOk} className="login-alert">{exitoRecuperar}</div>}
              <div style={s.field} className="login-field">
                <img src={correo} alt="correo" style={{ width: "16px", marginRight: "6px" }} />
                <input className="login-input" style={s.input} type="email" placeholder={t('login_reg_email_ph')}
                  value={emailRecuperar} onChange={e => setEmailRecuperar(e.target.value)} disabled={loadingRecuperar} />
              </div>
              <button type="submit" style={loadingRecuperar ? s.btnOff : s.btnMain} className="login-btn" disabled={loadingRecuperar}>
                {loadingRecuperar ? t('login_btn_rec_loading') : t('login_btn_rec')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRestablecer}>
              <div style={s.title} className="login-title">{t('login_res_title')}</div>
              {errorRestablecer && <div style={s.alertErr} className="login-alert">{errorRestablecer}</div>}
              {exitoRestablecer && <div style={s.alertOk} className="login-alert">{exitoRestablecer}</div>}
              <div style={s.field} className="login-field">
                <img src={candado} alt="password" style={{ width: "16px", marginRight: "6px" }} />
                <input className="login-input" style={s.input} type="password" placeholder={t('login_res_pass_ph')}
                  value={nuevaContrasena} onChange={e => setNuevaContrasena(e.target.value)} disabled={loadingRestablecer} />
              </div>
              <div style={s.field} className="login-field">
                <img src={candado} alt="password" style={{ width: "16px", marginRight: "6px" }} />
                <input className="login-input" style={s.input} type="password" placeholder={t('login_res_conf_ph')}
                  value={confirmarNueva} onChange={e => setConfirmarNueva(e.target.value)} disabled={loadingRestablecer} />
              </div>
              <button type="submit" style={loadingRestablecer ? s.btnOff : s.btnMain} className="login-btn" disabled={loadingRestablecer}>
                {loadingRestablecer ? t('login_btn_res_loading') : t('login_btn_res')}
              </button>
            </form>
          )}
        </div>

      
        <div style={s.panel} className="login-panel">
          {vista === 'login' ? (
            <>
              <div style={s.panelLogo}>DeviceGuard</div>
              <div style={s.panelTitle} className="login-panel-title">{t('login_panel_login_title')}</div>
              <div style={s.panelSub} className="login-panel-sub">{t('login_panel_login_sub1')}<br />{t('login_panel_login_sub2')}<br />{t('login_panel_login_sub3')}</div>
              <button style={s.btnOutline} className="login-btn-outline" onClick={irRegistro} type="button">{t('login_panel_login_btn')}</button>
            </>
          ) : vista === 'registro' ? (
            <>
              <div style={s.panelLogo}>DeviceGuard</div>
              <div style={s.panelTitle} className="login-panel-title">{t('login_panel_reg_title')}</div>
              <div style={s.panelSub} className="login-panel-sub">{t('login_panel_reg_sub1')}<br />{t('login_panel_reg_sub2')}<br />{t('login_panel_reg_sub3')}</div>
              <button style={s.btnOutline} className="login-btn-outline" onClick={irLogin} type="button">{t('login_panel_reg_btn')}</button>
            </>
          ) : vista === 'recuperar' ? (
            <>
              <div style={s.panelLogo}>DeviceGuard</div>
              <div style={s.panelTitle} className="login-panel-title">{t('login_panel_rec_title')}</div>
              <div style={s.panelSub} className="login-panel-sub">{t('login_panel_rec_sub1')}<br />{t('login_panel_rec_sub2')}<br />{t('login_panel_rec_sub3')}</div>
              <button style={s.btnOutline} className="login-btn-outline" onClick={irLogin} type="button">{t('login_panel_rec_btn')}</button>
            </>
          ) : (
            <>
              <div style={s.panelLogo}>DeviceGuard</div>
              <div style={s.panelTitle} className="login-panel-title">{t('login_panel_res_title')}</div>
              <div style={s.panelSub} className="login-panel-sub">{t('login_panel_res_sub1')}<br />{t('login_panel_res_sub2')}<br />{t('login_panel_res_sub3')}</div>
              <button style={s.btnOutline} className="login-btn-outline" onClick={irLogin} type="button">{t('login_panel_rec_btn')}</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Login;
