import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import { updateDispositivo } from "../services/api";
import "./Sidebar.css";
import dashboard_ from "../assets/icons/dashboard_.svg";
import dispositivos_ from "../assets/icons/Dispositivos_.svg";
import correo_ from "../assets/icons/correo_.svg";
import consultafiltros_ from "../assets/icons/consultafiltros_.svg";
import generar_reportes_ from "../assets/icons/generar_reportes_.svg";
import registrarsalida_ from "../assets/icons/registrarsalida_.svg";
import calendario_ from "../assets/icons/calendario_.svg";
import estadisticas_ from "../assets/icons/estadisticas_.svg";
import equipo_ from "../assets/icons/equipo_.svg";
import gestion_mantenimiento from "../assets/icons/gestion_mantenimiento.svg";
import settings from "../assets/icons/settings.svg";
import papelera_ from "../assets/icons/papelera_.svg";

function Sidebar({ usuario: usuarioProp, onLogout, onImpersonate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notifAbierto, setNotifAbierto] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);
  const [modalDispositivo, setModalDispositivo] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  

  const usuario = usuarioProp || JSON.parse(localStorage.getItem("usuario") || "{}");
  const adminOriginal = JSON.parse(localStorage.getItem("adminOriginal") || "null");
  const rol = usuario.rol;
  const esUsuario = rol === "usuario";
  const esTecnico = rol === "tecnico";
  const esSuperAdmin = rol === "super_admin";
  const [usuarios, setUsuarios] = useState([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [selectorAbierto, setSelectorAbierto] = useState(false);
 const tecnicosFiltrados = usuarios
  .filter(u => u.rol === "tecnico")
  .filter(u =>
    u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );


  useEffect(() => {
  if (!esTecnico) return;
  const cargar = () => {
    fetch(`http://localhost:5000/api/dispositivos/asignados/${usuario.id}`, {
      headers: { "x-usuario-id": usuario.id }
    })
      .then(r => r.json())
      .then(data => setDispositivos(Array.isArray(data) ? data : []))
      .catch(() => {});
  };
  cargar();
  const intervalo = setInterval(cargar, 30000); // refresca cada 30s
  return () => clearInterval(intervalo);
}, [esTecnico, usuario.id]);

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
    { path: "/dashboard", label: t('inicio'), icon: dashboard_ },
    ...(!esTecnico ? [{ path: "/dispositivos", label: t('dispositivos'), icon: dispositivos_ }] : []),
    { path: "/correo", label: t('correo'), icon: correo_ },
    { path: "/calendario", label: t('calendario'), icon: calendario_ },
    ...(!esUsuario ? [{ path: "/consultarfiltros", label: t('consulta_filtros'), icon: consultafiltros_ }] : []),
  ];

  const pageItems = esUsuario ? [
    { path: "/ajustes-cuenta", label: t('ajustes_cuenta_nav'), icon: settings },
  ] : esTecnico ? [
    { path: "/gestion", label: t('gestion_mantenimiento'), icon: gestion_mantenimiento },
    { path: "/registrarsalida", label: t('registrar_salida'), icon: registrarsalida_ },
    { path: "/reportes", label: t('generar_reportes'), icon: generar_reportes_ },
    { path: "/estadisticas", label: t('estadisticas'), icon: estadisticas_ },
    { path: "/papelera", label: "Papelera", icon: papelera_ },
    { path: "/ajustes-cuenta", label: t('ajustes_cuenta_nav'), icon: settings },
  ] : [
    { path: "/asignaciones", label: t('asignacion_title') || "Asignar Tareas", icon: gestion_mantenimiento }, 
    { path: "/reportes", label: t('generar_reportes'), icon: generar_reportes_ },
    { path: "/registrarsalida", label: t('registrar_salida'), icon: registrarsalida_ },
    { path: "/estadisticas", label: t('estadisticas'), icon: estadisticas_ },
    ...(esSuperAdmin || rol === "admin" ? [{ path: "/equipo", label: t('equipo'), icon: equipo_ }] : []),
    { path: "/gestion", label: t('gestion_mantenimiento'), icon: gestion_mantenimiento },
    { path: "/papelera", label: "Papelera", icon: papelera_ },
    { path: "/ajustes-cuenta", label: t('ajustes_cuenta_nav'), icon: settings },
  ];

  const handleConfirmarMantenimiento = async () => {
    if (!modalDispositivo) return;
    setConfirmando(true);
    try {
      await updateDispositivo(modalDispositivo.id, { estado: 'En Mantenimiento' });
      setDispositivos(prev => prev.map(d => d.id === modalDispositivo.id ? { ...d, estado: 'En Mantenimiento' } : d));
      setModalDispositivo(null);
    } catch (e) { console.error(e); }
    finally { setConfirmando(false); }
  };

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
        <div style={{ padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", background: "var(--bg-sidebar)" }}>
  <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px", background: "linear-gradient(135deg, #0492C2, #82EEFD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
    DeviceGuard
  </h1>
  {esTecnico && (
  <div style={{ position: "relative" }}>
    <button
      onClick={() => setNotifAbierto(!notifAbierto)}
      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {dispositivos.filter(d => d.estado === "En Revision").length > 0 && (
        <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "#fff", fontSize: "0.6rem", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {dispositivos.filter(d => d.estado === "En Revision").length}
        </span>
      )}
    </button>
  </div>
)}
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
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "1px" }}>{t('paginas')}</span>
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
                  {t('sidebar_simulando_como')}
                </p>
                <p style={{ margin: "0 0 8px", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {usuario.nombre}
                </p>
                <button
                  onClick={terminarImpersonacion}
                  style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", border: "none", background: "#ef4444", color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                >
                  {t('sidebar_volver_admin')}
                </button>
              </div>
            ) : (
              // Modo normal super_admin — selector
              <div>
                <p style={{ margin: "0 0 5px", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t('sidebar_simular_usuario')}
                </p>
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => setSelectorAbierto(!selectorAbierto)}
                    style={{ width: "100%", padding: "0.4rem 0.5rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)", fontSize: "0.75rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span>{t('sidebar_seleccionar_usuario')}</span>
                    <span>▾</span>
                  </div>
                  
                  {selectorAbierto && (
                    <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', marginBottom: '4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', zIndex: 100, boxShadow: '0 -10px 25px rgba(0,0,0,0.3)', maxHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '6px' }}>
                        <input
                          autoFocus
                          type="text"
                          placeholder={t('sidebar_buscar_usuario')}
                          value={busquedaUsuario}
                          onChange={(e) => setBusquedaUsuario(e.target.value)}
                          style={{ width: "100%", padding: "0.3rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text-main)", fontSize: "0.7rem", outline: "none" }}
                        />
                      </div>
                      <div style={{ overflowY: 'auto', flex: 1 }}>
                        {tecnicosFiltrados.length > 0 && (
                          <div style={{ padding: '4px 8px', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', background: 'var(--table-head)' }}>{t('sidebar_tecnicos')}</div>
                        )}
                        {tecnicosFiltrados.map(u => (
                          <div key={u.id} 
                            onClick={() => { setSelectorAbierto(false); setBusquedaUsuario(''); iniciarImpersonacion(u.id); }} 
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--table-head)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s' }}>
                            {u.nombre}
                          </div>
                        ))}
                        {usuariosFiltrados.length > 0 && (
                          <div style={{ padding: '4px 8px', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', background: 'var(--table-head)' }}>{t('sidebar_usuarios')}</div>
                        )}
                        {usuariosFiltrados.map(u => (
                          <div key={u.id} 
                            onClick={() => { setSelectorAbierto(false); setBusquedaUsuario(''); iniciarImpersonacion(u.id); }} 
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--table-head)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s' }}>
                            {u.nombre}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
              {usuario?.rol === "super_admin" ? "Super Admin" : usuario?.rol === "admin" ? t('admin') || "Administrador" : usuario?.rol === "tecnico" ? t('tecnico') : t('usuario_normal')}
            </p>
          </div>
        </div>
      </aside>

      {/* OVERLAY para cerrar sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* DROPDOWN NOTIFICACIONES - portal */}
      {notifAbierto && esTecnico && createPortal(
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99998 }} onClick={() => setNotifAbierto(false)} />
          <div style={{ position: "fixed", top: "70px", left: "270px", width: "290px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 99999, overflow: "hidden" }}>
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: "0.82rem", color: "var(--text-main)" }}>
              {t('sidebar_disp_asignados')}
            </div>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {dispositivos.filter(d => d.estado === "En Revision").length === 0 ? (
                <p style={{ padding: "1rem", fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>{t('sidebar_sin_disp_pendientes')}</p>
              ) : (
                dispositivos.filter(d => d.estado === "En Revision").map(d => (
                  <div key={d.id}
                    onClick={() => { setModalDispositivo(d); setNotifAbierto(false); }}
                    style={{ padding: "0.7rem 1rem", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "0.83rem", color: "var(--text-main)" }}>{d.nombre}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "var(--text-muted)" }}>{d.marca} · {d.tipo}</p>
                    <span style={{ display: "inline-block", marginTop: "5px", padding: "2px 8px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 700, background: "#f3e8ff", color: "#7e22ce" }}>
                      {d.estado}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* MODAL DISPOSITIVO - portal */}
      {modalDispositivo && createPortal(
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}
          onClick={() => setModalDispositivo(null)}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", width: "400px", maxWidth: "92%", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#151E3D,#0492C2)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: ".95rem" }}>{t('sidebar_disp_asignado')}</span>
              <button onClick={() => setModalDispositivo(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1rem" }}>✕</button>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ background: "var(--table-head)", borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-main)", marginBottom: ".75rem" }}>{modalDispositivo.nombre}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".5rem .75rem" }}>
                  {[
                    { label: t('estadisticas_col_marca'),  value: modalDispositivo.marca     || "—" },
                    { label: "Serial",                     value: modalDispositivo.serial    || "—" },
                    { label: t('estadisticas_col_tipo'),   value: modalDispositivo.tipo      || "—" },
                    { label: t('dash_col_estado'),         value: modalDispositivo.estado    || "—" },
                    { label: t('dash_col_ubicacion'),      value: modalDispositivo.ubicacion || "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: ".62rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: ".8rem", color: "var(--text-main)", fontWeight: 600 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              {modalDispositivo.estado === "En Revision" && (
                <p style={{ fontSize: ".8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  {t('sidebar_al_confirmar')} <strong style={{ color: "#0492C2" }}>{t('sidebar_en_mantenimiento_bold')}</strong> {t('sidebar_comenzaras')}
                </p>
              )}
              <div style={{ display: "flex", gap: ".75rem" }}>
                <button onClick={() => setModalDispositivo(null)} style={{ flex: 1, padding: ".65rem", background: "transparent", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                  {t('cerrar')}
                </button>
                {modalDispositivo.estado === "En Revision" && (
                  <button onClick={handleConfirmarMantenimiento} disabled={confirmando}
                    style={{ flex: 1, padding: ".65rem", background: "linear-gradient(135deg,#0492C2,#82EEFD)", border: "none", color: "#fff", borderRadius: "8px", cursor: confirmando ? "not-allowed" : "pointer", fontWeight: 700 }}>
                    {confirmando ? t('sidebar_guardando') : t('sidebar_iniciar_mant')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Sidebar;
