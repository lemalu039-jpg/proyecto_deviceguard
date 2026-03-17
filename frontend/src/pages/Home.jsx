import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Home.css';
import candado from '../assets/icons/logo-deviceguard.svg';

function Home() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

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

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page" ref={pageRef}>

    
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-icon">
            <img src={candado} alt="logo" style={{ width: '80px', height: '80px' }} />
          </div>
          <span className="nav-brand">Device<span>Guard</span></span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo('hero')}>Inicio</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>Módulos</button>
          <button className="nav-link" onClick={() => scrollTo('about')}>Nosotros</button>
          <button className="nav-link" onClick={() => scrollTo('contact')}>Contacto</button>
        </div>
        <button className="nav-btn" onClick={() => navigate('/login')}>Ingresar</button>
      </nav>

   
      <div className="hero" id="hero">
        <div className="hero-glow"></div>
        <div className="hero-tag anim-up">
          <div className="pulse-dot"></div>
          Control inteligente de equipos
        </div>
        <h1 className="hero-title anim-up d1">
          Gestión de<br />
          <span className="grad">dispositivos electrónicos</span><br />
          sin complicaciones
        </h1>
        <p className="hero-sub anim-up d2">
          Registra, monitorea y programa el mantenimiento de todos los equipos
          de tu institución desde un solo lugar, de forma rápida y segura.
        </p>
        <div className="hero-btns anim-up d3">
          <button className="btn-p" onClick={() => navigate('/login')}>Comenzar ahora ↗</button>
          <button className="btn-s" onClick={() => scrollTo('features')}>Conocer más</button>
        </div>
      </div>

      <div className="divider"></div>

    
      <div className="section" id="features">
        <div className="sec-tag anim-left">¿Qué hace DeviceGuard?</div>
        <div className="sec-title anim-left d1">Todo lo que necesitas<br />en un solo lugar</div>
        <div className="sec-sub anim-left d2">Cada módulo está diseñado para facilitar la gestión diaria de equipos en tu institución.</div>
        <div className="feat-grid">
          <div className="feat anim-up">
            <div className="feat-icon feat-icon-blue">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#82EEFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div className="feat-title">Registro y control</div>
            <div className="feat-desc">Registra todos los equipos con su tipo, serial, estado y ubicación con historial automático de uso.</div>
          </div>
          <div className="feat anim-up d1">
            <div className="feat-icon feat-icon-pink">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f48fb1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div className="feat-title">Mantenimiento</div>
            <div className="feat-desc">Programa mantenimientos preventivos y correctivos con historial completo de cada equipo.</div>
          </div>
          <div className="feat anim-up d2">
            <div className="feat-icon feat-icon-cyan">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#82EEFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="feat-title">Préstamos</div>
            <div className="feat-desc">Controla quién tiene cada equipo y genera alertas automáticas de vencimiento.</div>
          </div>
          <div className="feat anim-up d3">
            <div className="feat-icon feat-icon-green">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#81c784" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="feat-title">Roles y accesos</div>
            <div className="feat-desc">Administrador, técnico y usuario con permisos diferenciados para mayor seguridad.</div>
          </div>
        </div>
      </div>

      <div className="divider"></div>


      <div className="section" id="about">
        <div className="sec-tag anim-left">Nosotros</div>
        <div className="sec-title anim-left d1">¿Quiénes somos?</div>
        <div className="about-grid">
          <p className="sec-sub anim-left d2">
            DeviceGuard es una solución digital diseñada para mejorar el control,
            monitoreo y gestión de dispositivos tecnológicos en entornos educativos
            e institucionales.<br /><br />
            Nuestro propósito es ofrecer una plataforma clara, rápida y útil que
            ayude a mantener todo organizado y bajo control, sin procesos
            complicados ni papeleo extra.
          </p>
          <div className="about-list anim-right">
            <div className="about-item">
              <div className="about-item-icon feat-icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#82EEFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div>
                <div className="about-item-title">Monitoreo en tiempo real</div>
                <div className="about-item-desc">Consulta el estado de cada equipo al instante desde cualquier dispositivo.</div>
              </div>
            </div>
            <div className="about-item">
              <div className="about-item-icon feat-icon-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#81c784" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <div className="about-item-title">Fácil de usar</div>
                <div className="about-item-desc">Interfaz intuitiva sin curva de aprendizaje para cualquier usuario.</div>
              </div>
            </div>
            <div className="about-item">
              <div className="about-item-icon feat-icon-pink">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f48fb1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <div className="about-item-title">Seguro y confiable</div>
                <div className="about-item-desc">Acceso por roles con autenticación segura para proteger la información.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* MISIÓN */}
      <div className="section">
        <div className="mission-grid">
          <div className="mission-card anim-left">
            <div className="mission-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a0f1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="mission-card-title">Nuestro objetivo</div>
            <div className="mission-card-sub">Brindar una herramienta que facilite la gestión tecnológica institucional de forma eficiente, segura y accesible para todos.</div>
          </div>
          <div className="anim-right">
            <div className="sec-tag">Misión</div>
            <div className="sec-title d1">Tecnología al servicio<br />de la educación</div>
            <div className="sec-sub d2">Automatizamos el control de inventario y mantenimiento para que los equipos estén siempre disponibles y en óptimas condiciones.</div>
          </div>
        </div>
      </div>

   
      <div className="contact-section" id="contact">
        <div className="sec-tag">Contacto</div>
        <div className="sec-title" style={{ marginTop: '.3rem' }}>¿Tienes alguna pregunta?</div>
        <div className="sec-sub contact-sub">Estamos disponibles para apoyarte en el uso del sistema</div>
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
          Ingresar al sistema ↗
        </button>
      </div>

      

    </div>
  );
}

export default Home;
