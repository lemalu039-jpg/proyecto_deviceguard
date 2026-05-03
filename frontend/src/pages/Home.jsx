import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNavigate } from 'react-router-dom';
import './css/Home.css';
import candado from '../assets/icons/logo-deviceguard.svg';

import { useState } from 'react';
import axios from 'axios';

function CalificacionForm() {
  const [serial, setSerial] = useState('');
  const [dispositivo, setDispositivo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paso, setPaso] = useState(1);
  const [estrellasEmpresa, setEstrellasEmpresa] = useState(0);
  const [estrellasTecnico, setEstrellasTecnico] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  const buscar = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/calificaciones/serial/${serial.trim()}`);
      setDispositivo(res.data);
      setPaso(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al buscar dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (estrellasEmpresa === 0) { setError('Por favor califica la empresa'); return; }
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/calificaciones', {
        dispositivo_id: dispositivo.id,
        tecnico_id: dispositivo.tecnico_id,
        estrellas_empresa: estrellasEmpresa,
        estrellas_tecnico: estrellasTecnico || null,
        comentario: comentario || null
      });
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar calificación');
    } finally {
      setLoading(false);
    }
  };

  const Estrellas = ({ valor, onChange }) => (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => onChange(i)}
          style={{ fontSize: '2rem', cursor: 'pointer', color: i <= valor ? '#f59e0b' : '#d1d5db', transition: 'color 0.15s' }}>
          ★
        </span>
      ))}
    </div>
  );

  if (enviado) return (
    <div
  className="cal-card anim-up"
  style={{
    textAlign: 'center',
    padding: '2.5rem',
    background: '#0b1220',
    border: '1px solid #1e3a5f',
    color: '#fff'
  }}
>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}></div>
      <h3
  style={{
    background: 'linear-gradient(135deg,#0492C2,#82EEFD)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
    margin: '0 0 0.5rem'
  }}
>
  ¡Gracias por tu calificación!
</h3>
      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tu opinión nos ayuda a mejorar el servicio.</p>
    </div>
  );

  return (
    <div className="cal-card anim-up dark-card">
      {paso === 1 ? (
        <form onSubmit={buscar}>
          <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#1a1a2e' }}>Ingresa el serial de tu dispositivo</p>
          {error && <div className="cal-error">{error}</div>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={serial}
              onChange={e => setSerial(e.target.value)}
              placeholder="Ej: SN-PRO-01098"
              required
              style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e2e2e2', fontSize: '0.85rem', outline: 'none' }}
            />
            <button type="submit" disabled={loading}
              style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#0492C2,#82EEFD)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
              {loading ? '...' : 'Buscar'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={enviar}>
          <div style={{
  marginBottom: '1rem',
  padding: '0.75rem',
  background: '#091428',
  borderRadius: '8px',
  border: '1px solid #1e3a5f'
}}>
            <p style={{ margin: 0, fontWeight: 700, color: '#0369a1', fontSize: '0.9rem' }}>{dispositivo.nombre}</p>
            <p style={{ margin: '2px 0 0', color: '#0284c7', fontSize: '0.78rem' }}>{dispositivo.marca} · {dispositivo.serial}</p>
            {dispositivo.tecnico_nombre && (
              <p style={{ margin: '2px 0 0', color: '#0369a1', fontSize: '0.78rem' }}>Técnico: {dispositivo.tecnico_nombre}</p>
            )}
          </div>

          {error && <div className="cal-error">{error}</div>}

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: '0.4rem', fontSize: '0.9rem' }}>¿Cómo calificarías nuestro servicio?</p>
            <Estrellas valor={estrellasEmpresa} onChange={setEstrellasEmpresa} />
          </div>

          {dispositivo.tecnico_nombre && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: '0.4rem', fontSize: '0.9rem' }}>¿Cómo calificarías al técnico {dispositivo.tecnico_nombre}?</p>
              <Estrellas valor={estrellasTecnico} onChange={setEstrellasTecnico} />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Comentario (opcional)</p>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Cuéntanos tu experiencia..."
              rows={3}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e2e2e2', fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => { setPaso(1); setError(''); }}
  style={{ padding: '0.6rem 1rem', background: 'linear-gradient(135deg,#0492C2,#82EEFD)',color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
              ← Volver
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: '0.6rem', background: 'linear-gradient(135deg,#0492C2,#82EEFD)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
              {loading ? 'Enviando...' : 'Enviar calificación'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const originalTheme = document.body.getAttribute('data-theme');
    document.body.setAttribute('data-theme', 'light');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    page.querySelectorAll('.anim-up, .anim-left, .anim-right').forEach(el => {
      observer.observe(el);
    });

    page.querySelectorAll('.hero .anim-up').forEach(el => {
      el.classList.add('visible');
    });

    return () => {
      observer.disconnect();
      if (originalTheme) {
        document.body.setAttribute('data-theme', originalTheme);
      }
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page" ref={pageRef}>

      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-icon">
            <img src={candado} alt="logo" style={{ width: '72px', height: '42px' }} />
          </div>
          <span className="nav-brand">Device<span>Guard</span></span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo('hero')}>{t('home_inicio')}</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>{t('home_modulos')}</button>
          <button className="nav-link" onClick={() => scrollTo('about')}>{t('home_nosotros')}</button>
          <button className="nav-link" onClick={() => scrollTo('contact')}>{t('home_contacto')}</button>
          <button className="nav-link" onClick={() => scrollTo('calificar')}>Calificar</button>
        </div>
        <button className="nav-btn" onClick={() => navigate('/login')}>{t('home_ingresar')}</button>
      </nav>

      <div className="hero" id="hero">
        <div className="hero-glow"></div>
        <div className="hero-tag anim-up">
          <div className="pulse-dot"></div>
          {t('home_hero_tag')}
        </div>
        <h1 className="hero-title anim-up d1">
          {t('home_hero_title1')}<br />
          <span className="grad">{t('home_hero_title2')}</span><br />
          {t('home_hero_title3')}
        </h1>
        <p className="hero-sub anim-up d2">
          {t('home_hero_sub')}
        </p>
        <div className="hero-btns anim-up d3">
          <button className="btn-p" onClick={() => navigate('/login')}>{t('home_hero_btn1')}</button>
          <button className="btn-s" onClick={() => scrollTo('features')}>{t('home_hero_btn2')}</button>
        </div>
      </div>

      <div className="divider"></div>

      <div className="section" id="features">
        <div className="sec-tag anim-left">{t('home_sec_tag1')}</div>
        <div className="sec-title anim-left d1">{t('home_sec_title1')}<br />{t('home_sec_title1b')}</div>
        <div className="sec-sub anim-left d2">{t('home_sec_sub1')}</div>
        <div className="feat-grid">
          <div className="feat anim-up">
            <div className="feat-icon feat-icon-blue">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#82EEFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div className="feat-title">{t('home_feat1_title')}</div>
            <div className="feat-desc">{t('home_feat1_desc')}</div>
          </div>
          <div className="feat anim-up d1">
            <div className="feat-icon feat-icon-pink">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f48fb1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div className="feat-title">{t('home_feat2_title')}</div>
            <div className="feat-desc">{t('home_feat2_desc')}</div>
          </div>
          <div className="feat anim-up d2">
            <div className="feat-icon feat-icon-cyan">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#82EEFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="feat-title">{t('home_feat3_title')}</div>
            <div className="feat-desc">{t('home_feat3_desc')}</div>
          </div>
          <div className="feat anim-up d3">
            <div className="feat-icon feat-icon-green">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#81c784" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="feat-title">{t('home_feat4_title')}</div>
            <div className="feat-desc">{t('home_feat4_desc')}</div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="section" id="about">
        <div className="sec-tag anim-left">{t('home_sec_tag2')}</div>
        <div className="sec-title anim-left d1">{t('home_sec_title2')}</div>
        <div className="about-grid">
          <p className="sec-sub anim-left d2">
            {t('home_about_p1')}<br /><br />
            {t('home_about_p2')}
          </p>
          <div className="about-list anim-right">
            <div className="about-item">
              <div className="about-item-icon feat-icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#82EEFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div>
                <div className="about-item-title">{t('home_about_item1_title')}</div>
                <div className="about-item-desc">{t('home_about_item1_desc')}</div>
              </div>
            </div>
            <div className="about-item">
              <div className="about-item-icon feat-icon-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#81c784" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <div className="about-item-title">{t('home_about_item2_title')}</div>
                <div className="about-item-desc">{t('home_about_item2_desc')}</div>
              </div>
            </div>
            <div className="about-item">
              <div className="about-item-icon feat-icon-pink">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f48fb1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <div className="about-item-title">{t('home_about_item3_title')}</div>
                <div className="about-item-desc">{t('home_about_item3_desc')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="section">
        <div className="mission-grid">
          <div className="mission-card anim-left">
            <div className="mission-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a0f1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="mission-card-title">{t('home_mission_title')}</div>
            <div className="mission-card-sub">{t('home_mission_sub')}</div>
          </div>
          <div className="anim-right">
            <div className="sec-tag">{t('home_sec_tag3')}</div>
            <div className="sec-title d1">{t('home_sec_title3')}<br />{t('home_sec_title3b')}</div>
            <div className="sec-sub d2">{t('home_sec_sub3')}</div>
          </div>
        </div>
      </div>

      {/* Sección Calificaciones */}
<div className="divider"></div>

<div className="section" id="calificar" style={{ textAlign: 'center' }}>
  <div className="sec-tag anim-left">Calificaciones</div>

  <div className="sec-title anim-left d1">
    ¿Recibiste tu dispositivo?<br />
    Cuéntanos tu experiencia
  </div>

  <div className="sec-sub anim-left d2">
    Ingresa el serial de tu dispositivo y califica nuestro servicio
  </div>

  <CalificacionForm />
</div>


      <div className="contact-section" id="contact">
        <div className="sec-tag">{t('home_contact_tag')}</div>
        <div className="sec-title" style={{ marginTop: '.3rem' }}>{t('home_contact_title')}</div>
        <div className="sec-sub contact-sub">{t('home_contact_sub')}</div>
        <div className="contact-items">
          <div className="contact-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#82EEFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            deviceguard@correo.com
          </div>
          <div className="contact-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#82EEFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Colombia
          </div>
          <div className="contact-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#82EEFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            +57 (1) 596-2000
          </div>
        </div>
        <button className="btn-p contact-cta" onClick={() => navigate('/login')}>
          {t('home_contact_btn')}
        </button>
      </div>

    </div>
  );
}

export default Home;