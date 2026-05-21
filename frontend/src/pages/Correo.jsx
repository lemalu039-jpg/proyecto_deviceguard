import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getCorreos,
  getMensajesContactos,
  getConversacion,
  enviarMensaje,
} from "../services/api";
import "./css/Correo.css";
import { useLanguage } from "../context/LanguageContext.jsx";
import Pagination from "../components/Pagination.jsx";

// Íconos inline simples
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const VISTAS = { ENVIADOS: "enviados", CHAT: "chat" };

function Correo() {
  const { t } = useLanguage();
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const userId = usuarioGuardado?.id;
  const userRol = usuarioGuardado?.rol;
  const location = useLocation();

  const [vista, setVista] = useState(VISTAS.ENVIADOS);
  const [correos, setCorreos] = useState([]);
  const [busquedaHistorial, setBusquedaHistorial] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 10;
  const [contactos, setContactos] = useState([]);
  const [contactoActivo, setContactoActivo] = useState(null);
  const contactoActivoRef = useRef(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);
  const pollingRef = useRef(null);
  const contactoInicializado = useRef(false);

  // Mantener ref sincronizada con el estado para usarla en el polling
  const setContactoActivoSafe = (c) => {
    contactoActivoRef.current = c;
    setContactoActivo(c);
  };

  useEffect(() => {
    cargarCorreos();
    if (userId) cargarContactos();
    return () => clearInterval(pollingRef.current);
  }, [userId]);

  // Si viene desde Equipo con un contacto preseleccionado — solo una vez
  useEffect(() => {
    if (contactoInicializado.current) return;
    if (location.state?.contacto && contactos.length > 0) {
      const c = contactos.find(x => x.id === location.state.contacto.id) || location.state.contacto;
      setContactoActivoSafe(c);
      setVista(VISTAS.CHAT);
      contactoInicializado.current = true;
    }
  }, [contactos]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    clearInterval(pollingRef.current);
    if (contactoActivo && userId) {
      cargarConversacion(contactoActivo.id);
      // Usar ref en el intervalo para evitar stale closure
      pollingRef.current = setInterval(() => {
        if (contactoActivoRef.current) {
          cargarConversacion(contactoActivoRef.current.id);
        }
      }, 4000);
    }
    return () => clearInterval(pollingRef.current);
  }, [contactoActivo]);

  const cargarCorreos = async () => {
    try {
      const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");
      const res = usuarioActual.rol === 'usuario'
        ? await getCorreos(usuarioActual.id)
        : await getCorreos();
      setCorreos(res.data);
    } catch (e) { console.error(e); }
  };

  const cargarContactos = async () => {
    try {
      const res = await getMensajesContactos(userId);
      setContactos(res.data);
      // Si hay un contacto activo, actualizarlo con los datos frescos del array
      if (contactoActivoRef.current) {
        const actualizado = res.data.find(c => c.id === contactoActivoRef.current.id);
        if (actualizado) {
          // Preservar nombre y correo pero actualizar badges
          setContactoActivoSafe({ ...contactoActivoRef.current, ...actualizado });
        }
      }
    } catch (e) { console.error(e); }
  };

  const cargarConversacion = async (contactId) => {
    try {
      const res = await getConversacion(userId, contactId);
      setMensajes(res.data);
      // Limpiar badge solo en el array local sin reemplazar el objeto completo
      // Usamos función de actualización para no crear dependencia de estado
      setContactos(prev => {
        const idx = prev.findIndex(c => c.id === contactId);
        if (idx === -1 || prev[idx].no_leidos === 0) return prev; // sin cambio = sin re-render
        const next = [...prev];
        next[idx] = { ...next[idx], no_leidos: 0 };
        return next;
      });
    } catch (e) { console.error(e); }
  };

  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !contactoActivo) return;
    try {
      await enviarMensaje({ remitente_id: userId, destinatario_id: contactoActivo.id, mensaje: nuevoMensaje });
      setNuevoMensaje("");
      await cargarConversacion(contactoActivo.id);
      mostrarToast(t('correo_mensaje_enviado'));
    } catch (e) {
      mostrarToast(t('correo_error_enviar'), true);
    }
  };

  const mostrarToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  const formatHora = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  };

  const formatFecha = (f) => {
    if (!f) return "";
    return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  };

  const iniciales = (nombre = "") =>
    nombre.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  return (
    <div className={`cmail-root${vista === VISTAS.CHAT && contactoActivo ? " chat-activo" : ""}`}>
      {/* ── SIDEBAR ── */}
      <aside className="cmail-sidebar">
        <div className="cmail-sidebar-top">
          <div className="cmail-logo-area">
            <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" size={18} />
            <span>{t('correo_mi_correo')}</span>
          </div>
        </div>

        <nav className="cmail-nav">
          <p className="cmail-nav-label">{t('correo_notificaciones')}</p>
          <button
            className={`cmail-nav-item ${vista === VISTAS.ENVIADOS ? "active" : ""}`}
            onClick={() => setVista(VISTAS.ENVIADOS)}
          >
            <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            <span>{t('correo_enviados')}</span>
            <span className="cmail-badge">{correos.length}</span>
          </button>

          <p className="cmail-nav-label" style={{ marginTop: "1.2rem" }}>{t('correo_mensajeria')}</p>
          <button
            className={`cmail-nav-item ${vista === VISTAS.CHAT ? "active" : ""}`}
            onClick={() => { setVista(VISTAS.CHAT); cargarContactos(); }}
          >
            <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <span>{t('correo_mensajes')}</span>
            {contactos.some(c => c.no_leidos > 0) && (
              <span className="cmail-badge cmail-badge-red">
                {contactos.reduce((a, c) => a + (c.no_leidos || 0), 0)}
              </span>
            )}
          </button>
        </nav>

        {vista === VISTAS.CHAT && (
          <div className="cmail-contactos">
            <p className="cmail-nav-label">{t('usuarios')}</p>
            {contactos.map(c => (
              <button
                key={c.id}
                className={`cmail-contacto-item ${contactoActivo?.id === c.id ? "active" : ""}`}
                onClick={() => {
                  setContactoActivoSafe(c);
                  contactoInicializado.current = true;
                }}
              >
                <div className="cmail-avatar">{iniciales(c.nombre)}</div>
                <div className="cmail-contacto-info">
                  <span className="cmail-contacto-nombre">{c.nombre}</span>
                  <span className="cmail-contacto-correo">{c.correo}</span>
                </div>
                {c.no_leidos > 0 && (
                  <span className="cmail-badge cmail-badge-red">{c.no_leidos}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* ── PANEL PRINCIPAL ── */}
      <main className="cmail-main">
        {vista === VISTAS.ENVIADOS && (
          <div className="cmail-enviados">
            <div className="cmail-panel-header">
              <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={18} />
              <span>{t('correo_historial')}</span>
              <span className="cmail-count-pill">{correos.length} {t('correo_registros')}</span>
            </div>

            {/* Buscador historial */}
            <div className="cmail-search-bar">
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" size={15} />
              <input
                type="text"
                placeholder={t('correo_buscar_historial')}
                value={busquedaHistorial}
                onChange={e => { setBusquedaHistorial(e.target.value); setPaginaActual(1); }}
              />
              {busquedaHistorial && (
                <button onClick={() => { setBusquedaHistorial(""); setPaginaActual(1); }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={13} />
                </button>
              )}
            </div>

            {(() => {
              const filtrados = correos.filter(c => {
                const q = busquedaHistorial.toLowerCase();
                return !q ||
                  c.destinatario?.toLowerCase().includes(q) ||
                  c.asunto?.toLowerCase().includes(q) ||
                  c.mensaje?.toLowerCase().includes(q);
              });
              const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
              const paginados = filtrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

              return (
                <>
                  <div className="cmail-table-wrap">
                    <table className="cmail-table">
                      <thead>
                        <tr>
                          <th>{t('correo_destinatario')}</th>
                          <th>{t('asunto')}</th>
                          <th>{t('mensaje')}</th>
                          <th>{t('fecha')}</th>
                          <th>{t('hora')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginados.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="cmail-empty">
                              <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" size={32} />
                              <p>{busquedaHistorial ? t('sin_resultados') || "Sin resultados" : t('correo_no_hay')}</p>
                            </td>
                          </tr>
                        ) : (
                          paginados.map(c => (
                            <tr key={c.id}>
                              <td data-label={t('correo_destinatario')}>
                                <div className="cmail-dest-cell">
                                  <div className="cmail-avatar cmail-avatar-sm">{iniciales(c.destinatario)}</div>
                                  {c.destinatario}
                                </div>
                              </td>
                              <td data-label={t('asunto')}><span className="cmail-asunto">{c.asunto}</span></td>
                              <td data-label={t('mensaje')}><span className="cmail-msg-preview">{c.mensaje}</span></td>
                              <td data-label={t('fecha')}>{formatFecha(c.fecha_envio)}</td>
                              <td data-label={t('hora')}><span className="cmail-hora">{c.hora_envio}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    totalItems={filtrados.length}
                    itemsPerPage={ITEMS_POR_PAGINA}
                    currentPage={paginaActual}
                    onPageChange={setPaginaActual}
                  />
                </>
              );
            })()}
          </div>
        )}

        {vista === VISTAS.CHAT && (
          <div className="cmail-chat-panel">
            {!contactoActivo ? (
              <div className="cmail-chat-placeholder">
                <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" size={48} />
                <p>{t('correo_selecciona_usuario')}</p>
              </div>
            ) : (
              <>
                <div className="cmail-chat-header">
                  <div className="cmail-avatar cmail-avatar-md">{iniciales(contactoActivo.nombre)}</div>
                  <div>
                    <span className="cmail-chat-nombre">{contactoActivo.nombre}</span>
                    <span className="cmail-chat-correo">{contactoActivo.correo}</span>
                  </div>
                </div>

                <div className="cmail-chat-messages">
                  {mensajes.length === 0 && (
                    <div className="cmail-chat-empty">
                      <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" size={36} />
                      <p className="cmail-chat-empty-hint">{t('correo_no_mensajes')}</p>
                    </div>
                  )}
                  {mensajes.map(m => {
                    const esMio = m.remitente_id === userId;
                    return (
                      <div key={m.id} className={`cmail-bubble-wrap ${esMio ? "mio" : "suyo"}`}>
                        {!esMio && (
                          <div className="cmail-avatar cmail-avatar-sm">{iniciales(m.remitente_nombre)}</div>
                        )}
                        <div className={`cmail-bubble ${esMio ? "mio" : "suyo"}`}>
                          <p>{m.mensaje}</p>
                          <span className="cmail-bubble-hora">{formatHora(m.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <div className="cmail-chat-input">
                  <input
                    type="text"
                    placeholder={t('correo_escribe_mensaje')}
                    value={nuevoMensaje}
                    onChange={e => setNuevoMensaje(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEnviarMensaje()}
                  />
                  <button className="cmail-btn-enviar" onClick={handleEnviarMensaje}>
                    <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={16} />
                    {t('enviar')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`cmail-toast ${toast.error ? "error" : "ok"}`}>
          {toast.error
            ? <Icon d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            : <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          }
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default Correo;
