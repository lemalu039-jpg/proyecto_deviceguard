import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Sidebar.css";
import dashboard_ from "../assets/icons/dashboard_.svg";
import dispositivos_ from "../assets/icons/dispositivos_.svg";
import correo_ from "../assets/icons/correo_.svg";
import consultafiltros_ from "../assets/icons/consultafiltros_.svg";
import generar_reportes_ from "../assets/icons/generar_reportes_.svg";
import registrarsalida_ from "../assets/icons/registrarsalida_.svg";
import calendario_ from "../assets/icons/calendario_.svg";
import estadisticas_ from "../assets/icons/estadisticas_.svg";
import equipo_ from "../assets/icons/equipo_.svg";
import gestion_mantenimiento from "../assets/icons/gestion_mantenimiento.svg";
import settings from "../assets/icons/settings.svg";

function Sidebar({ usuario: usuarioProp, onLogout, onImpersonate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const usuario = usuarioProp || JSON.parse(localStorage.getItem("usuario") || "{}");
  const adminOriginal = JSON.parse(localStorage.getItem("adminOriginal") || "null");
  const rol = usuario.rol;
  const esUsuario = rol === "usuario";
  const esTecnico = rol === "tecnico";
  const esSuperAdmin = rol === "super_admin";
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
 const tecnicosFiltrados = usuarios
  .filter(u => u.rol === "tecnico")
  .filter(u =>
    u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

const usuariosFiltrados = usuarios
  .filter(u => u.rol === "usuario")
  .filter(u =>
    u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );
  // Cargar usuarios para el selector de impersonación (solo super_admin)
  useEffect(() => {
    if (!esSuperAdmin) return;
    const u = JSON.parse(localStorage.getItem("usuario") || "{}");
    fetch("http://localhost:5000/api/usuarios", {
      headers: { "x-usuario-id": u.id }
    })
      .then(r => r.json())
      .then(data => setUsuarios(Array.isArray(data) ? data.filter(u => u.rol !== "super_admin") : []))
      .catch(() => {});
  }, [esSuperAdmin]);

  const iniciarImpersonacion = (usuarioId) => {
    if (!usuarioId) return;
    const target = usuarios.find(u => String(u.id) === String(usuarioId));
    if (!target) return;

    // Guardar admin original si no está ya guardado
    if (!adminOriginal) {
      localStorage.setItem("adminOriginal", JSON.stringify(usuario));
    }
    localStorage.setItem("usuario", JSON.stringify(target));
    onImpersonate?.(target);
    navigate("/dashboard");
  };

  const terminarImpersonacion = () => {
    if (!adminOriginal) return;
    localStorage.setItem("usuario", JSON.stringify(adminOriginal));
    localStorage.removeItem("adminOriginal");
    onImpersonate?.(adminOriginal);
    navigate("/dashboard");
  };

  const menuItems = [
    { path: "/dashboard", label: "Inicio", icon: dashboard_ },
    ...(!esTecnico ? [{ path: "/dispositivos", label: "Dispositivos", icon: dispositivos_ }] : []),
    { path: "/correo", label: "Correo", icon: correo_ },
    { path: "/calendario", label: "Calendario", icon: calendario_ },
    ...(!esUsuario ? [{ path: "/consultarfiltros", label: "Consulta con Filtros", icon: consultafiltros_ }] : []),
  ];

  const pageItems = esUsuario ? [
    { path: "/ajustes-cuenta", label: "Ajustes de Cuenta", icon: settings },
  ] : esTecnico ? [
    { path: "/gestion", label: "Gestion de mantenimiento", icon: gestion_mantenimiento },
    { path: "/registrarsalida", label: "Registrar Salida", icon: registrarsalida_ },
    { path: "/reportes", label: "Generar Reportes", icon: generar_reportes_ },
    { path: "/estadisticas", label: "Estadisticas", icon: estadisticas_ },
    { path: "/ajustes-cuenta", label: "Ajustes de Cuenta", icon: settings },
  ] : [
    { path: "/reportes", label: "Generar Reportes", icon: generar_reportes_ },
    { path: "/registrarsalida", label: "Registrar Salida", icon: registrarsalida_ },
    { path: "/estadisticas", label: "Estadisticas", icon: estadisticas_ },
    { path: "/equipo", label: "Equipo", icon: equipo_ },
    { path: "/gestion", label: "Gestion de mantenimiento", icon: gestion_mantenimiento },
    { path: "/ajustes-cuenta", label: "Ajustes de Cuenta", icon: settings },
  ];

  const navStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center", gap: "1rem",
    padding: "0.75rem 1rem", borderRadius: "10px",
    color: isActive ? "#ffffff" : "var(--text-muted)",
    background: isActive ? "linear-gradient(135deg, #0492C2, #0a6fa8)" : "transparent",
    fontWeight: isActive ? 700 : 500, fontSize: "0.9rem", textDecoration: "none",
    boxShadow: isActive ? "0 4px 15px rgba(4, 146, 194, 0.35)" : "none",
    transition: "all 0.2s ease",
  });

  const renderIcon = (item) => ({ isActive }) => (
    <>
      <img
        src={item.icon}
        alt={item.label}
        style={{
          width: "22px",
          height: "22px",
          objectFit: "contain",
          flexShrink: 0,
          filter: isActive
            ? "brightness(0) invert(1)"
            : "var(--icon-filter, brightness(0) invert(0.5))"
        }}
      />
      {item.label}
    </>
  );

  return (
    <>
      {/* HAMBURGER MENU BUTTON - Solo en mobile */}
      <div className="sidebar-hamburger">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      </div>

      <aside
        style={{
          width: "260px",
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
        className={sidebarOpen ? "active" : ""}
      >
        <div style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--border)", background: "var(--bg-sidebar)" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px", background: "linear-gradient(135deg, #0492C2, #82EEFD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            DeviceGuard
          </h1>
        </div>

        <div style={{ flexGrow: 1, overflowY: "auto", padding: "1rem 0" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0 1rem" }}>
            {menuItems.map(item => (
              <NavLink key={item.path} to={item.path} style={navStyle} onClick={() => setSidebarOpen(false)}>
                {renderIcon(item)}
              </NavLink>
            ))}
          </nav>

          {pageItems.length > 0 && (
            <>
              <div style={{ padding: "1.5rem 1.5rem 0.75rem 1.5rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "1px" }}>PAGINAS</span>
              </div>
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0 1rem" }}>
                {pageItems.map(item => (
                  <NavLink key={item.path} to={item.path} style={navStyle} onClick={() => setSidebarOpen(false)}>
                    {renderIcon(item)}
                  </NavLink>
                ))}
              </nav>
            </>
          )}
        </div>

        {/* Panel de impersonación — solo super_admin o cuando está impersonando */}
        {(esSuperAdmin || adminOriginal) && (
          <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border)" }}>
            {adminOriginal ? (
              // Modo impersonación activa — mostrar banner y botón volver
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "0.6rem 0.8rem" }}>
                <p style={{ margin: "0 0 6px", fontSize: "0.7rem", fontWeight: 700, color: "#ef4444" }}>
                  👁 Simulando como:
                </p>
                <p style={{ margin: "0 0 8px", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {usuario.nombre}
                </p>
                <button
                  onClick={terminarImpersonacion}
                  style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", border: "none", background: "#ef4444", color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                >
                  ← Volver a Super Admin
                </button>
              </div>
            ) : (
              // Modo normal super_admin — selector
              <div>
                <p style={{ margin: "0 0 5px", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Simular usuario
                </p>
                <select
                  defaultValue=""
                  onChange={e => iniciarImpersonacion(e.target.value)}
                  style={{ width: "100%", padding: "0.4rem 0.5rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)", fontSize: "0.75rem", cursor: "pointer", outline: "none" }}
                >
                  <option value="" disabled>Seleccionar usuario...</option>
                  <optgroup label="Técnicos">
                    {tecnicosFiltrados.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Usuarios">
                    {usuariosFiltrados.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                  </optgroup>
                </select>
                <input
  type="text"
  placeholder="Buscar usuario..."
  value={busquedaUsuario}
  onChange={(e) => setBusquedaUsuario(e.target.value)}
  style={{
    width: "100%",
    padding: "0.4rem 0.5rem",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    background: "var(--bg-card)",
    color: "var(--text-main)",
    fontSize: "0.75rem",
    marginBottom: "5px",
    outline: "none"
  }}
/>
              </div>
            )}
          </div>
        )}

        {/* User Profile Info fixed at bottom */}
        <div style={{ padding: "1.2rem 1.5rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--bg-sidebar)", marginTop: "auto" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>
            {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "U"}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {usuario?.nombre || "Usuario"}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {usuario?.rol === "super_admin" ? "Super Admin" : usuario?.rol === "tecnico" ? "Técnico" : "Usuario"}
            </p>
          </div>
        </div>
      </aside>

      {/* OVERLAY para cerrar sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}

export default Sidebar;
