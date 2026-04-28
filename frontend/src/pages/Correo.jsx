import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getCorreos,
  getMensajesContactos,
  getConversacion,
  enviarMensaje,
} from "../services/api";
import "./CSS/Correo.css";

// Íconos inline simples
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const VISTAS = { ENVIADOS: "enviados", CHAT: "chat" };

function Correo() {
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const userId = usuarioGuardado?.id;
  const userRol = usuarioGuardado?.rol;
  const location = useLocation();

  const [vista, setVista] = useState(VISTAS.ENVIADOS);
  const [correos, setCorreos] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [contactoActivo, setContactoActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    cargarCorreos();
    if (userId) cargarContactos();
    return () => clearInterval(pollingRef.current);
  }, [userId]);

  // Si viene desde Equipo con un contacto preseleccionado
  useEffect(() => {
    if (location.state?.contacto && contactos.length > 0) {
      const c = contactos.find(x => x.id === location.state.contacto.id) || location.state.contacto;
      setContactoActivo(c);
      setVista(VISTAS.CHAT);
    }
  }, [contactos]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    clearInterval(pollingRef.current);
    if (contactoActivo && userId) {
      cargarConversacion(contactoActivo.id);
      pollingRef.current = setInterval(() => cargarConversacion(contactoActivo.id), 4000);
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
    } catch (e) { console.error(e); }
  };

  const cargarConversacion = async (contactId) => {
    try {
      const res = await getConversacion(userId, contactId);
      setMensajes(res.data);
      // Actualizar badge de no leídos
      setContactos(prev =>
        prev.map(c => c.id === contactId ? { ...c, no_leidos: 0 } : c)
      );
    } catch (e) { console.error(e); }
  };

  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !contactoActivo) return;
    try {
      await enviarMensaje({ remitente_id: userId, destinatario_id: contactoActivo.id, mensaje: nuevoMensaje });
      setNuevoMensaje("");
      await cargarConversacion(contactoActivo.id);
      mostrarToast("Mensaje enviado");
    } catch (e) {
      mostrarToast("Error al enviar mensaje", true);
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
    <div className="cmail-root">
      {/* ── SIDEBAR ── */}
      <aside className="cmail-sidebar">
        <div className="cmail-sidebar-top">
          <div className="cmail-logo-area">
            <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" size={18} />
            <span>Mi Correo</span>
          </div>
        </div>

        <nav className="cmail-nav">
          <p className="cmail-nav-label">Notificaciones</p>
          <button
            className={`cmail-nav-item ${vista === VISTAS.ENVIADOS ? "active" : ""}`}
            onClick={() => setVista(VISTAS.ENVIADOS)}
          >
            <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            <span>Enviados</span>
            <span className="cmail-badge">{correos.length}</span>
          </button>

          <p className="cmail-nav-label" style={{ marginTop: "1.2rem" }}>Mensajería</p>
          <button
            className={`cmail-nav-item ${vista === VISTAS.CHAT ? "active" : ""}`}
            onClick={() => { setVista(VISTAS.CHAT); cargarContactos(); }}
          >
            <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <span>Mensajes</span>
            {contactos.some(c => c.no_leidos > 0) && (
              <span className="cmail-badge cmail-badge-red">
                {contactos.reduce((a, c) => a + (c.no_leidos || 0), 0)}
              </span>
            )}
          </button>
        </nav>

        {vista === VISTAS.CHAT && (
          <div className="cmail-contactos">
            <p className="cmail-nav-label">Usuarios</p>
            {contactos.map(c => (
              <button
                key={c.id}
                className={`cmail-contacto-item ${contactoActivo?.id === c.id ? "active" : ""}`}
                onClick={() => setContactoActivo(c)}
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
              <span>Historial de correos enviados</span>
              <span className="cmail-count-pill">{correos.length} registros</span>
            </div>
            <div className="cmail-table-wrap">
              <table className="cmail-table">
                <thead>
                  <tr>
                    <th>Destinatario</th>
                    <th>Asunto</th>
                    <th>Mensaje</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {correos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="cmail-empty">
                        <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" size={32} />
                        <p>No hay correos registrados</p>
                      </td>
                    </tr>
                  ) : (
                    correos.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div className="cmail-dest-cell">
                            <div className="cmail-avatar cmail-avatar-sm">{iniciales(c.destinatario)}</div>
                            {c.destinatario}
                          </div>
                        </td>
                        <td><span className="cmail-asunto">{c.asunto}</span></td>
                        <td><span className="cmail-msg-preview">{c.mensaje}</span></td>
                        <td>{formatFecha(c.fecha_envio)}</td>
                        <td><span className="cmail-hora">{c.hora_envio}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {vista === VISTAS.CHAT && (
          <div className="cmail-chat-panel">
            {!contactoActivo ? (
              <div className="cmail-chat-placeholder">
                <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" size={48} />
                <p>Selecciona un usuario para iniciar una conversación</p>
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
                      <p>Aún no hay mensajes. ¡Empieza la conversación!</p>
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
                    placeholder="Escribe un mensaje..."
                    value={nuevoMensaje}
                    onChange={e => setNuevoMensaje(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEnviarMensaje()}
                  />
                  <button className="cmail-btn-enviar" onClick={handleEnviarMensaje}>
                    <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={16} />
                    Enviar
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
