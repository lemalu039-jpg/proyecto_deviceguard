import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

const PATH_NAMES = {
  "/dashboard": "Dashboard",
  "/dispositivos": "Registro de Dispositivos",
  "/registrarsalida": "Registrar Salida",
  "/prestamos": "Préstamos",
  "/gestion": "Gestión de Mantenimiento",
  "/usuarios": "Usuarios",
  "/equipo": "Equipo",
  "/ajustes-cuenta": "Ajustes de Cuenta",
  "/reportes": "Generar Reportes",
  "/estadisticas": "Estadísticas",
  "/consultarfiltros": "Consulta con Filtros",
  "/correo": "Correo",
  "/calendario": "Calendario"
};

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // If we are at root or login, do not show breadcrumbs
  if (pathnames.length === 0 || pathnames[0] === "login") {
    return null;
  }

  return (
    <div className="breadcrumbs">
      <Link to="/dashboard" className="breadcrumb-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Inicio
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        // If it's a dynamic parameter (like an ID in /historial/1), just show the ID or generic text
        let displayName = PATH_NAMES[routeTo] || name;
        if (pathnames[0] === "historial" && index === 1) {
          displayName = "Detalle";
        }

        return (
          <span key={name} className="breadcrumb-item">
            <span className="breadcrumb-separator">/</span>
            {isLast ? (
              <span className="breadcrumb-current">{displayName}</span>
            ) : (
              <Link to={routeTo} className="breadcrumb-link">
                {displayName}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default Breadcrumbs;
