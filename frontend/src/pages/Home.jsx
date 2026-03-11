import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 5C15 5 11 9 11 14V18H9C7.9 18 7 18.9 7 20V33C7 34.1 7.9 35 9 35H31C32.1 35 33 34.1 33 33V20C33 18.9 32.1 18 31 18H29V14C29 9 25 5 20 5ZM20 8C23.3 8 26 10.7 26 14V18H14V14C14 10.7 16.7 8 20 8ZM20 23C21.1 23 22 23.9 22 25C22 25.7 21.6 26.4 21 26.7V29C21 29.6 20.6 30 20 30C19.4 30 19 29.6 19 29V26.7C18.4 26.4 18 25.7 18 25C18 23.9 18.9 23 20 23Z" fill="#E91E63"/>
            </svg>
            <h1>DeviceGuard</h1>
          </div>
          <nav className="nav-menu">
            <a href="#inicio">Inicio</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>
            <button className="btn-login" onClick={() => navigate('/login')}>
              Únete a nosotros
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-subtitle">Somos</p>
          <h2 className="hero-title">La mejor empresa<br/>de seguridad que vas a<br/>encontrar</h2>
          <button className="btn-hero" onClick={() => navigate('/login')}>
            Escríbenos
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="nosotros">
        <div className="about-content">
          <div className="about-card">
            <h3>¿Quienes Somos?</h3>
          </div>
          <div className="about-text">
            <p>
              <strong>DeviceGuard</strong> es una solución digital diseñada para mejorar el control,
              monitoreo y gestión de dispositivos tecnológicos en entornos educativos o
              institucionales.
            </p>
            <p>
              El sistema permite registrar y organizar el inventario de equipos como
              Computadores, tabletas y proyectores, facilitando su préstamo, devolución,
              mantenimiento y seguimiento en tiempo
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-text">
            <p>
              Entendemos que el control de Muchos recursos tecnológicos es una necesidad
              Real, y muchas veces no se tiene una solución práctica para manejarlo.
            </p>
            <p>
              <strong>Nuestro Propósito</strong> es ofrecer una plataforma clara, rápida y útil, que ayude a
              Mantener todo Organizado y Bajo Control, sin Necesidad de procesos complicados
              o Papeleo Extra
            </p>
          </div>
          <div className="mission-card">
            <h3>Nuestro Objetivo</h3>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="features-title">¿Que hace DeviceGuard?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="15" y="20" width="50" height="35" rx="3" stroke="white" strokeWidth="2"/>
                <rect x="25" y="30" width="30" height="15" rx="2" stroke="white" strokeWidth="2"/>
                <path d="M40 45V50" stroke="white" strokeWidth="2"/>
                <circle cx="40" cy="35" r="3" fill="white"/>
              </svg>
            </div>
            <h4>Registro y Control<br/>de Equipos.</h4>
            <p>
              Permitimos registrar todos los equipos con sus datos: Tipo, Serial,
              Estado, Ubicación, Accesorios. Ayuda a asignar y Devolver
              dispositivos fácilmente, con historial automático de quién lo usó y cuándo
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="20" y="35" width="40" height="20" rx="2" stroke="white" strokeWidth="2"/>
                <circle cx="30" cy="45" r="2" fill="white"/>
                <circle cx="40" cy="45" r="2" fill="white"/>
              </svg>
            </div>
            <h4>Monitoreo y<br/>Mantenimiento en Tiempo<br/>Real</h4>
            <p>
              Facilitamos la consulta en tiempo Real de la disponibilidad de cada
              equipo, permitiendo registrar Mantenimientos, observaciones
              y fallas con todo el historial guardado
            </p>
          </div>

          <div className="feature-card feature-card-wide">
            <div className="feature-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="25" y="20" width="30" height="40" rx="3" stroke="white" strokeWidth="2"/>
                <line x1="30" y1="30" x2="45" y2="30" stroke="white" strokeWidth="2"/>
                <line x1="30" y1="37" x2="45" y2="37" stroke="white" strokeWidth="2"/>
                <line x1="30" y1="44" x2="40" y2="44" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <h4>Reportes y Análisis de Datos</h4>
            <p>
              Genera reportes claros para hacer seguimiento, exportarlos y tomar
              decisiones informadas
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 5C15 5 11 9 11 14V18H9C7.9 18 7 18.9 7 20V33C7 34.1 7.9 35 9 35H31C32.1 35 33 34.1 33 33V20C33 18.9 32.1 18 31 18H29V14C29 9 25 5 20 5ZM20 8C23.3 8 26 10.7 26 14V18H14V14C14 10.7 16.7 8 20 8ZM20 23C21.1 23 22 23.9 22 25C22 25.7 21.6 26.4 21 26.7V29C21 29.6 20.6 30 20 30C19.4 30 19 29.6 19 29V26.7C18.4 26.4 18 25.7 18 25C18 23.9 18.9 23 20 23Z" fill="#E91E63"/>
            </svg>
            <h3>DeviceGuard</h3>
            <div className="social-icons">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="YouTube">▶</a>
              <a href="#" aria-label="LinkedIn">in</a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Links</h4>
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
            <a href="#">Youtube</a>
          </div>

          <div className="footer-project">
            <h4>Resumen proyecto</h4>
            <p>
              Se necesita un sistema web con NFC para monitorear en tiempo real computadores
              y televisores del primer piso de la Nave 4. Debe mostrar estado, uso y ubicación,
              generar alertas y reportes, y funcionar desde celular.
            </p>
            <p>
              El contrato dura 6 meses e incluye desarrollo, pruebas,
              capacitación y soporte por 12 meses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
