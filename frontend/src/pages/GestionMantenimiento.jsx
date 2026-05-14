import { useEffect, useState } from "react";
import { getDispositivos, updateDispositivo } from "../services/api";
import api from "../services/api";
import "./css/GestionMantenimiento.css";
import Pagination from "../components/Pagination";
import TableSkeleton from "../components/TableSkeleton";
import { useLanguage } from "../context/LanguageContext.jsx";

// Icono SVG inline
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function GestionMantenimiento() {
  const { t } = useLanguage();
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const itemsPerPage = 7;

  // Modal de costo
  const [modalCosto, setModalCosto] = useState(null);
  const [costo, setCosto] = useState('');
  const [guardandoCosto, setGuardandoCosto] = useState(false);
  const [errorCosto, setErrorCosto] = useState('');
  // Mapa de estado_pago por dispositivo_id
  const [estadosPago, setEstadosPago] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const res = await getDispositivos();
      const user = JSON.parse(localStorage.getItem('usuario') || '{}');
      const isAdmin = user.rol === 'admin' || user.rol === 'super_admin';
      const filtrados = res.data.filter(d => {
        const estadoValido = d.estado === "En Revision" || d.estado === "Listo para Entrega" || d.estado === "En Mantenimiento";
        if (!estadoValido) return false;
        if (!isAdmin && d.tecnico_id !== user.id) return false;
        return true;
      });
      setDispositivos(filtrados);

      // Cargar estado_pago del mantenimiento activo de cada dispositivo
      const pagosMap = {};
      await Promise.all(
        filtrados.map(async (d) => {
          try {
            const r = await api.get(`/pagos/datos/${d.id}`);
            pagosMap[d.id] = r.data.estado_pago || 'Pendiente';
          } catch {
            // Sin mantenimiento activo con costo → sin estado de pago
            pagosMap[d.id] = null;
          }
        })
      );
      setEstadosPago(pagosMap);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  // Intercepta el cambio de estado: si es "En Mantenimiento" abre el modal de costo
  const handleCambioEstado = (dispositivo, nuevoEstado) => {
    if (!nuevoEstado) return;
    if (nuevoEstado === "En Mantenimiento") {
      setModalCosto({ id: dispositivo.id, nombre: dispositivo.nombre, serial: dispositivo.serial });
      setCosto('');
      setErrorCosto('');
    } else {
      cambiarEstado(dispositivo.id, nuevoEstado);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    setLoading(true);
    try {
      await updateDispositivo(id, { estado: nuevoEstado });
      loadData();
    } catch (error) {
      console.error(error);
      alert(t('mant_error_actualizar'));
    } finally {
      setLoading(false);
    }
  };

  // Confirmar: cambia el estado e incluye el costo en la misma llamada
  const confirmarCosto = async () => {
    const costoNum = parseFloat(costo);
    if (!costo || isNaN(costoNum) || costoNum < 0) {
      setErrorCosto('Ingresa un monto válido (mayor o igual a 0).');
      return;
    }
    setGuardandoCosto(true);
    setErrorCosto('');
    try {
      // Costo viaja junto al cambio de estado en un solo request
      await updateDispositivo(modalCosto.id, {
        estado: 'En Mantenimiento',
        costo_mantenimiento: costoNum
      });
      setModalCosto(null);
      loadData();
    } catch (error) {
      console.error(error);
      setErrorCosto(error?.response?.data?.error || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setGuardandoCosto(false);
    }
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case "Listo para Entrega": return "badge-listo-entrega";
      case "En Revision":        return "badge-revision";
      case "En Mantenimiento":   return "badge-mantenimiento";
      case "Entregado":          return "badge-entregado";
      default:                   return "";
    }
  };

 return (
  <div className="mant-wrapper">
    <div className="mant-wrapper-tittle">
      <h1 className="page-title">{t('mant_title')}</h1>
    </div>

    <div className="mant-card">
      <div className="mant-card-title">
        <div className="mant-dot"></div>
        <span style={{ whiteSpace: 'nowrap' }}>{t('dash_lista_dispositivos')}</span>
        <input
          type="text"
          placeholder={t('dash_buscar_ph')}
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setCurrentPage(1); }}
          style={{ flex: 1, minWidth: '160px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none' }}
        />
        <select
          value={filtroEstado}
          onChange={e => { setFiltroEstado(e.target.value); setCurrentPage(1); }}
          style={{ padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}
        >
          <option value="">{t('dash_todos_estados')}</option>
          <option value="En Revision">{t('dash_en_revision')}</option>
          <option value="En Mantenimiento">{t('dash_en_mantenimiento')}</option>
          <option value="Listo para Entrega">{t('dash_listo_entrega')}</option>
        </select>
        {(busqueda || filtroEstado) && (
          <button
            onClick={() => { setBusqueda(''); setFiltroEstado(''); setCurrentPage(1); }}
            style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            {t('dash_limpiar')} ✕
          </button>
        )}
      </div>

      <div className="mant-table-wrap">
        <table className="mant-table">
          <thead>
            <tr>
              <th>{t('dash_col_nombre')}</th>
              <th>{t('dash_col_serial')}</th>
              <th>{t('dash_col_reg_por')}</th>
              <th>{t('mant_col_estado_actual')}</th>
              <th>Estado de pago</th>
              <th>{t('mant_col_cambiar_estado')}</th>
            </tr>
          </thead>

          <tbody>
            {loadingData ? (
              <TableSkeleton rows={7} cols={5} noWrapper />
            ) : dispositivos.filter(d => {
                const texto = `${d.nombre} ${d.serial} ${d.registrado_por || ''}`.toLowerCase();
                const okBusqueda = !busqueda || texto.includes(busqueda.toLowerCase());
                const okEstado   = !filtroEstado || d.estado === filtroEstado;
                return okBusqueda && okEstado;
              }).length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '.82rem' }}>
                  {t('sin_resultados')}
                </td>
              </tr>
            ) : (
              dispositivos
                .filter(d => {
                  const texto = `${d.nombre} ${d.serial} ${d.registrado_por || ''}`.toLowerCase();
                  const okBusqueda = !busqueda || texto.includes(busqueda.toLowerCase());
                  const okEstado   = !filtroEstado || d.estado === filtroEstado;
                  return okBusqueda && okEstado;
                })
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.82rem' }}>{d.nombre}</div>
                      <div style={{ fontSize: '.71rem', color: 'var(--text-muted)', marginTop: '1px' }}>{d.tipo || ''}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{d.serial}</td>
                    <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                      {d.registrado_por || '—'}
                    </td>
                    <td>
                      <span className={`mant-badge ${getBadgeClass(d.estado)}`}>
                        {d.estado}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const ep = estadosPago[d.id];
                        if (!ep) return <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>—</span>;
                        if (ep === 'Pagado') return (
                          <span className="mant-badge mant-pago-badge-pagado">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: 4 }}>
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Pagado
                          </span>
                        );
                        return (
                          <span className="mant-badge mant-pago-badge-pendiente">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 4 }}>
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            Pendiente
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <select
                        className="mant-select"
                        value=""
                        onChange={(e) => handleCambioEstado(d, e.target.value)}
                      >
                        <option value="">{t('mant_cambiar_estado')}</option>
                        {d.estado === "En Revision" && (
                          <option value="En Mantenimiento">{t('dash_en_mantenimiento')}</option>
                        )}
                        {d.estado === "En Mantenimiento" && (
                          <option value="Listo para Entrega">{t('dash_listo_entrega')}</option>
                        )}
                        {d.estado === "Listo para Entrega" && (
                          <option value="Entregado">{t('dash_entregado')}</option>
                        )}
                      </select>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={dispositivos.filter(d => {
          const texto = `${d.nombre} ${d.serial} ${d.registrado_por || ''}`.toLowerCase();
          const okBusqueda = !busqueda || texto.includes(busqueda.toLowerCase());
          const okEstado   = !filtroEstado || d.estado === filtroEstado;
          return okBusqueda && okEstado;
        }).length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>

    {/* ── MODAL REGISTRO DE COSTO ─────────────────────────── */}
    {modalCosto && (
      <div className="mant-modal-overlay" onClick={() => !guardandoCosto && setModalCosto(null)}>
        <div className="mant-modal" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="mant-modal-header">
            <div className="mant-modal-header-icon">
              <Icon d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" size={18} />
            </div>
            <div>
              <h3 className="mant-modal-title">Registrar costo de mantenimiento</h3>
              <p className="mant-modal-subtitle">El dispositivo pasará a <strong>En Mantenimiento</strong></p>
            </div>
            <button className="mant-modal-close" onClick={() => !guardandoCosto && setModalCosto(null)} disabled={guardandoCosto}>
              <Icon d="M18 6L6 18M6 6l12 12" size={16} />
            </button>
          </div>

          {/* Info del dispositivo */}
          <div className="mant-modal-device-info">
            <div className="mant-modal-device-row">
              <span className="mant-modal-device-label">Dispositivo</span>
              <span className="mant-modal-device-val">{modalCosto.nombre}</span>
            </div>
            <div className="mant-modal-device-row">
              <span className="mant-modal-device-label">Serial</span>
              <span className="mant-modal-device-val" style={{ fontFamily: 'monospace' }}>{modalCosto.serial}</span>
            </div>
            <div className="mant-modal-device-row">
              <span className="mant-modal-device-label">Referencia de pago</span>
              <span className="mant-modal-device-val mant-ref-badge">MANT-{modalCosto.id}</span>
            </div>
            <div className="mant-modal-device-row">
              <span className="mant-modal-device-label">Estado de pago</span>
              <span className="mant-modal-device-val mant-pago-badge">Pendiente</span>
            </div>
          </div>

          {/* Campo de costo */}
          <div className="mant-modal-body">
            <label className="mant-modal-label">
              Costo del mantenimiento <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="mant-modal-input-wrap">
              <span className="mant-modal-currency">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={costo}
                onChange={e => { setCosto(e.target.value); setErrorCosto(''); }}
                className="mant-modal-input"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && confirmarCosto()}
              />
              <span className="mant-modal-currency-suffix">COP</span>
            </div>
            {errorCosto && (
              <div className="mant-modal-error">
                <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={14} />
                {errorCosto}
              </div>
            )}
            <p className="mant-modal-hint">
              Este monto quedará registrado como <strong>Pendiente de pago</strong> y el usuario podrá pagarlo cuando el dispositivo esté listo para entrega.
            </p>
          </div>

          {/* Footer */}
          <div className="mant-modal-footer">
            <button
              className="mant-modal-btn-cancel"
              onClick={() => setModalCosto(null)}
              disabled={guardandoCosto}
            >
              Cancelar
            </button>
            <button
              className="mant-modal-btn-confirm"
              onClick={confirmarCosto}
              disabled={guardandoCosto}
            >
              {guardandoCosto ? (
                <>
                  <span className="mant-spinner" />
                  Guardando...
                </>
              ) : (
                <>
                  <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={15} />
                  Confirmar y registrar
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    )}
  </div>
);
}

export default GestionMantenimiento;