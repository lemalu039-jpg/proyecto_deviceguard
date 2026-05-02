import { useState, useEffect } from "react";
import { getDispositivosPapelera, restaurarDispositivo, eliminarDefinitivoDispositivo } from "../services/api";
import Pagination from "../components/Pagination";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./css/Papelera.css";

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function Papelera() {
  const { t } = useLanguage();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esSuperAdmin = usuario.rol === "super_admin";

  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modales
  const [modalRestaurar, setModalRestaurar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDispositivosPapelera();
      setDispositivos(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error cargando papelera:', e);
      const msg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Error al cargar la papelera';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const mostrarToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRestaurar = async () => {
    if (!modalRestaurar) return;
    setProcesando(true);
    try {
      await restaurarDispositivo(modalRestaurar.id);
      mostrarToast(`"${modalRestaurar.nombre}" restaurado correctamente`);
      setModalRestaurar(null);
      cargar();
    } catch {
      mostrarToast("Error al restaurar el dispositivo", true);
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminarDefinitivo = async () => {
    if (!modalEliminar) return;
    setProcesando(true);
    try {
      await eliminarDefinitivoDispositivo(modalEliminar.id);
      mostrarToast(`"${modalEliminar.nombre}" eliminado permanentemente`);
      setModalEliminar(null);
      cargar();
    } catch {
      mostrarToast("Error al eliminar el dispositivo", true);
    } finally {
      setProcesando(false);
    }
  };

  const getBadgeStyle = (estado) => {
    const base = {
      display: 'inline-block', fontSize: '.65rem', fontWeight: 700,
      padding: '2px 9px', borderRadius: '20px',
    };
    switch (estado) {
      case 'Listo para Entrega': return { ...base, background: '#fcfbdc', color: '#dacd1c' };
      case 'En Revision':        return { ...base, background: '#f3e8ff', color: '#7e22ce' };
      case 'En Mantenimiento':   return { ...base, background: '#ffedd5', color: '#ea580c' };
      case 'Entregado':          return { ...base, background: '#f3fef2', color: '#16a34a' };
      default:                   return { ...base, background: 'var(--input-bg)', color: 'var(--text-muted)' };
    }
  };

  const filtrados = dispositivos.filter(d => {
    const texto = `${d.nombre} ${d.serial} ${d.marca} ${d.tipo}`.toLowerCase();
    return !busqueda || texto.includes(busqueda.toLowerCase());
  });

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  return (
    <div className="papelera-wrapper">
      {/* Header */}
      <div className="papelera-header">
        <div className="papelera-header-icon">
          <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" size={22} />
        </div>
        <div>
          <h1 className="papelera-titulo">Papelera</h1>
          <p className="papelera-subtitulo">
            Dispositivos eliminados — pueden restaurarse o eliminarse permanentemente
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="papelera-card">
        <div className="papelera-card-title">
          <div className="papelera-dot"></div>
          <span>Dispositivos eliminados</span>
          <input
            type="text"
            placeholder="Buscar por nombre, serial, marca..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setCurrentPage(1); }}
            className="papelera-search"
          />
          {busqueda && (
            <button className="papelera-btn-clear" onClick={() => { setBusqueda(""); setCurrentPage(1); }}>
              Limpiar ✕
            </button>
          )}
          <span className="papelera-count">{filtrados.length} registros</span>
        </div>

        <div className="papelera-table-wrap">
          {loading ? (
            <p className="papelera-empty">Cargando...</p>
          ) : error ? (
            <p className="papelera-empty" style={{ color: '#dc2626' }}>
              ⚠ {error}
            </p>
          ) : (
            <table className="papelera-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Serial</th>
                  <th>Marca</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Registrado por</th>
                  <th>Fecha registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="papelera-empty">
                      {busqueda ? "Sin resultados para la búsqueda" : "La papelera está vacía"}
                    </td>
                  </tr>
                ) : (
                  filtrados
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map(d => (
                      <tr key={d.id}>
                        <td>
                          <div className="papelera-dev-name">{d.nombre}</div>
                          <div className="papelera-dev-type">{d.tipo || ""}</div>
                        </td>
                        <td className="papelera-serial">{d.serial}</td>
                        <td>{d.marca || "—"}</td>
                        <td>{d.ubicacion || "—"}</td>
                        <td>
                          <span style={getBadgeStyle(d.estado)}>{d.estado || "—"}</span>
                        </td>
                        <td className="papelera-muted">{d.registrado_por || "—"}</td>
                        <td>
                          {formatFecha(d.fecha_registro)}
                          {d.hora_registro && (
                            <div className="papelera-hora">{d.hora_registro}</div>
                          )}
                        </td>
                        <td>
                          <div className="papelera-acciones">
                            <button
                              className="papelera-btn-restaurar"
                              onClick={() => setModalRestaurar(d)}
                              title="Restaurar dispositivo"
                            >
                              <Icon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" size={13} />
                              Restaurar
                            </button>
                            {esSuperAdmin && (
                              <button
                                className="papelera-btn-eliminar"
                                onClick={() => setModalEliminar(d)}
                                title="Eliminar permanentemente"
                              >
                                <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={13} />
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          totalItems={filtrados.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Restaurar */}
      {modalRestaurar && (
        <div className="papelera-modal-overlay" onClick={() => setModalRestaurar(null)}>
          <div className="papelera-modal" onClick={e => e.stopPropagation()}>
            <div className="papelera-modal-icon restaurar">
              <Icon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" size={28} />
            </div>
            <p className="papelera-modal-msg">
              ¿Restaurar <strong>{modalRestaurar.nombre}</strong>?<br />
              <span>El dispositivo volverá a estar disponible en el sistema.</span>
            </p>
            <div className="papelera-modal-btns">
              <button className="papelera-btn-cancel" onClick={() => setModalRestaurar(null)}>
                Cancelar
              </button>
              <button className="papelera-btn-confirm-restaurar" onClick={handleRestaurar} disabled={procesando}>
                {procesando ? "Restaurando..." : "Sí, restaurar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar permanente */}
      {modalEliminar && (
        <div className="papelera-modal-overlay" onClick={() => setModalEliminar(null)}>
          <div className="papelera-modal" onClick={e => e.stopPropagation()}>
            <div className="papelera-modal-icon eliminar">
              <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={28} />
            </div>
            <p className="papelera-modal-msg">
              ¿Eliminar permanentemente <strong>{modalEliminar.nombre}</strong>?<br />
              <span>Esta acción no se puede deshacer.</span>
            </p>
            <div className="papelera-modal-btns">
              <button className="papelera-btn-cancel" onClick={() => setModalEliminar(null)}>
                Cancelar
              </button>
              <button className="papelera-btn-confirm-eliminar" onClick={handleEliminarDefinitivo} disabled={procesando}>
                {procesando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`papelera-toast ${toast.error ? "error" : "ok"}`}>
          <Icon d={toast.error
            ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          } size={16} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default Papelera;
