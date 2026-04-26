import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, toggleUsuarioStatus } from "../services/api";
import "./CSS/Equipo.css";
import Pagination from "../components/Pagination";

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const iniciales = (nombre = "") =>
  nombre.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

const COLORES = ["#2d3a8c","#7c3aed","#0891b2","#059669","#d97706","#dc2626","#db2777"];
const colorPorId = (id) => COLORES[id % COLORES.length];

function Equipo() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    primerNombre: "", apellido: "", correo: "",
    telefono: "", puesto: "", genero: "Masculino", contrasena: "123456", rol: "usuario"
  });
  const [formEditar, setFormEditar] = useState({ nombre: "", correo: "", rol: "usuario" });
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => { cargarUsuarios(); }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await getUsuarios();
      setUsuarios(res.data);
    } catch (e) { console.error(e); }
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAgregar = async (e) => {
    e.preventDefault();
    try {
      const nombre = `${form.primerNombre} ${form.apellido}`.trim();
      await createUsuario({
        nombre,
        correo: form.correo,
        contrasena: form.contrasena,
        rol: form.rol,
      });
      mostrarToast("Usuario agregado correctamente");
      setModalAbierto(false);
      resetForm();
      cargarUsuarios();
    } catch (err) {
      mostrarToast("Error al agregar usuario", true);
    }
  };

  const resetForm = () => {
    setForm({ primerNombre: "", apellido: "", correo: "", telefono: "", puesto: "", genero: "Masculino", contrasena: "123456", rol: "usuario" });
    setFoto(null);
    setFotoPreview(null);
  };

  const mostrarToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  const abrirEditar = (u) => {
    setUsuarioSeleccionado(u);
    const partes = u.nombre?.split(" ") || [];
    setFormEditar({
      nombre: u.nombre || "",
      correo: u.correo || "",
      rol: u.rol || "usuario",
    });
    setModalEditar(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    try {
      await updateUsuario(usuarioSeleccionado.id, {
        nombre: formEditar.nombre,
        correo: formEditar.correo,
        rol: formEditar.rol,
      });
      mostrarToast("Usuario actualizado correctamente");
      setModalEditar(false);
      cargarUsuarios();
    } catch {
      mostrarToast("Error al actualizar usuario", true);
    }
  };

  const abrirEliminar = (u) => {
    setUsuarioSeleccionado(u);
    setModalEliminar(true);
  };

  const handleEliminar = async () => {
    try {
      await deleteUsuario(usuarioSeleccionado.id);
      mostrarToast("Usuario eliminado correctamente");
      setModalEliminar(false);
      cargarUsuarios();
    } catch {
      mostrarToast("Error al eliminar usuario", true);
    }
  };

  const handleToggleStatus = async (u) => {
    try {
      const nuevoEstado = u.activo === 1 ? 0 : 1;
      await toggleUsuarioStatus(u.id, nuevoEstado);
      mostrarToast(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
      cargarUsuarios();
    } catch {
      mostrarToast("Error al cambiar estado del usuario", true);
    }
  };

  return (
    <div className="equipo-root">
      {/* Header */}
      <div className="equipo-header">
        <h1 className="equipo-titulo">Equipo</h1>
        <button className="equipo-btn-add" onClick={() => setModalAbierto(true)} style={{ background: 'linear-gradient(135deg, #0492C2, #82EEFD)', borderRadius: '10px', padding: '0.6rem 1.4rem', fontSize: '0.875rem' }}>
          <Icon d="M12 5v14M5 12h14" size={16} />
          Añadir Usuario
        </button>
      </div>

      {/* Tarjetas */}
      <div className="equipo-cards-grid">
        {usuarios.map(u => (
          <div key={u.id} className="equipo-card">
            <div className="equipo-card-avatar" style={{ background: colorPorId(u.id) }}>
              {iniciales(u.nombre)}
            </div>
            <span className="equipo-card-nombre">{u.nombre}</span>
            <span className="equipo-card-correo">{u.correo}</span>
            <span className={`equipo-card-rol ${
              u.rol === "super_admin" ? "super-admin" : 
              u.rol === "tecnico" ? "tecnico" : 
              "usuario"
            }`}>
              {u.rol === "super_admin" ? "Super Admin" : 
               u.rol === "tecnico" ? "Técnico" : 
               "Usuario"}
            </span>
            {u.id !== usuarioActual.id && (
              <button className="equipo-card-msg-btn" onClick={() => navigate("/correo", { state: { contacto: u } })}>
                <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" size={14} />
                Message
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="equipo-tabla-section">
        <div className="equipo-tabla-header">
          <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" size={18} />
          <span>Lista de usuarios</span>
          <span className="equipo-tabla-pill">{usuarios.length} registros</span>
        </div>

        {/* Buscador */}
        <div className="equipo-busqueda">
          <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={e => {
              setBusqueda(e.target.value);
              setCurrentPage(1);
            }}
          />
          {busqueda && (
            <button onClick={() => {
              setBusqueda("");
              setCurrentPage(1);
            }}>
              <Icon d="M18 6L6 18M6 6l12 12" size={14} />
            </button>
          )}
        </div>

        <div className="equipo-tabla-wrap">
          <table className="equipo-tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Fecha registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filtrados = usuarios.filter(u =>
                  u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                  u.correo?.toLowerCase().includes(busqueda.toLowerCase())
                );
                if (filtrados.length === 0) return (
                  <tr><td colSpan="5" className="equipo-tabla-empty">No se encontraron usuarios</td></tr>
                );
                
                // Paginación
                const indexOfLastItem = currentPage * itemsPerPage;
                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                const currentItems = filtrados.slice(indexOfFirstItem, indexOfLastItem);

                return currentItems.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="equipo-tabla-user">
                        <div className="equipo-tabla-avatar" style={{ background: colorPorId(u.id) }}>
                          {iniciales(u.nombre)}
                        </div>
                        <span>{u.nombre}</span>
                      </div>
                    </td>
                    <td>{u.correo}</td>
                    <td>
                      <span className={`equipo-badge ${
                        u.activo === 0 ? "inactivo" :
                        u.rol === "super_admin" ? "super-admin" : 
                        u.rol === "tecnico" ? "tecnico" : 
                        "usuario"
                      }`}>
                        {u.activo === 0 ? "Suspendido" : 
                         u.rol === "super_admin" ? "Super Admin" : 
                         u.rol === "tecnico" ? "Técnico" : 
                         "Usuario"}
                      </span>
                    </td>
                    <td>{u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString("es-CO") : "—"}</td>
                    <td>
                      <div className="equipo-acciones">
                        <button className="equipo-btn-editar" onClick={() => abrirEditar(u)} title="Editar">
                          <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" size={14} />
                          Editar
                        </button>
                        <button 
                          className="equipo-btn-suspender" 
                          onClick={() => handleToggleStatus(u)} 
                          title={u.activo === 0 ? "Activar" : "Suspender"}
                          style={{ background: u.activo === 0 ? "#16a34a" : "#dc2626" }}
                        >
                          <Icon d={u.activo === 0 ? "M5 13l4 4L19 7" : "M18.36 6.64a9 9 0 11-12.73 0M12 2v10"} size={14} />
                          {u.activo === 0 ? "Activar" : "Suspender"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        
        {/* Usamos el componente Pagination, la cantidad de items depende de la búsqueda */}
        <Pagination
          totalItems={usuarios.filter(u =>
            u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.correo?.toLowerCase().includes(busqueda.toLowerCase())
          ).length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Añadir */}
      {modalAbierto && (
        <div className="equipo-modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="equipo-modal" onClick={e => e.stopPropagation()}>
            <div className="equipo-modal-titulo">
              <span>Añadir Miembro del Equipo</span>
              <button className="equipo-modal-close" onClick={() => { setModalAbierto(false); resetForm(); }}>
                <Icon d="M18 6L6 18M6 6l12 12" size={18} />
              </button>
            </div>

            <form onSubmit={handleAgregar} className="equipo-modal-form">
              {/* Foto */}
              <div className="equipo-foto-area">
                <div className="equipo-foto-circle" onClick={() => fileRef.current.click()}>
                  {fotoPreview
                    ? <img src={fotoPreview} alt="preview" />
                    : <Icon d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z" size={28} />
                  }
                </div>
                <button type="button" className="equipo-foto-btn" onClick={() => fileRef.current.click()}>
                  Subir Foto
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFoto} />
              </div>

              {/* Campos */}
              <div className="equipo-form-grid">
                <div className="equipo-form-group">
                  <label>Primer Nombre</label>
                  <input name="primerNombre" placeholder="Ingresa Primer Nombre" value={form.primerNombre} onChange={handleChange} required />
                </div>
                <div className="equipo-form-group">
                  <label>Apellido</label>
                  <input name="apellido" placeholder="Ingresa Apellido" value={form.apellido} onChange={handleChange} required />
                </div>
                <div className="equipo-form-group">
                  <label>Correo</label>
                  <input name="correo" type="email" placeholder="Ingresa tu Correo" value={form.correo} onChange={handleChange} required />
                </div>
                <div className="equipo-form-group">
                  <label>Número Telefónico</label>
                  <input name="telefono" placeholder="Ingresa el Número Telefónico" value={form.telefono} onChange={handleChange} />
                </div>
                <div className="equipo-form-group">
                  <label>Puesto de Trabajo</label>
                  <input name="puesto" placeholder="CEO" value={form.puesto} onChange={handleChange} />
                </div>
                <div className="equipo-form-group">
                  <label>Género</label>
                  <select name="genero" value={form.genero} onChange={handleChange}>
                    <option>Masculino</option>
                    <option>Femenino</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="equipo-form-group">
                  <label>Rol</label>
                  <select name="rol" value={form.rol} onChange={handleChange}>
                    <option value="usuario">Usuario</option>
                    <option value="tecnico">Técnico</option>
                  </select>
                </div>
                <div className="equipo-form-group">
                  <label>Contraseña inicial</label>
                  <input name="contrasena" type="password" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} required />
                </div>
              </div>

              <button type="submit" className="equipo-btn-submit">Agregar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <div className="equipo-modal-overlay" onClick={() => setModalEditar(false)}>
          <div className="equipo-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="equipo-modal-titulo">
              <span>Editar Usuario</span>
              <button className="equipo-modal-close" onClick={() => setModalEditar(false)}>
                <Icon d="M18 6L6 18M6 6l12 12" size={18} />
              </button>
            </div>
            <form onSubmit={handleEditar} className="equipo-modal-form">
              <div className="equipo-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div className="equipo-form-group">
                  <label>Nombre completo</label>
                  <input value={formEditar.nombre} onChange={e => setFormEditar({ ...formEditar, nombre: e.target.value })} required />
                </div>
                <div className="equipo-form-group">
                  <label>Correo</label>
                  <input type="email" value={formEditar.correo} onChange={e => setFormEditar({ ...formEditar, correo: e.target.value })} required />
                </div>
                <div className="equipo-form-group">
                  <label>Rol</label>
                  <select value={formEditar.rol} onChange={e => setFormEditar({ ...formEditar, rol: e.target.value })}>
                    <option value="usuario">Usuario</option>
                    <option value="tecnico">Técnico</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="equipo-btn-submit">Guardar cambios</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="equipo-modal-overlay" onClick={() => setModalEliminar(false)}>
          <div className="equipo-modal equipo-modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="equipo-confirm-icon">
              <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={32} />
            </div>
            <p className="equipo-confirm-msg">
              ¿Eliminar a <strong>{usuarioSeleccionado?.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="equipo-confirm-btns">
              <button className="equipo-btn-cancel" onClick={() => setModalEliminar(false)}>Cancelar</button>
              <button className="equipo-btn-delete" onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`equipo-toast ${toast.error ? "error" : "ok"}`}>
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

export default Equipo;
