import { useState, useEffect } from "react";
import { Modal } from 'bootstrap';
import {
  getDispositivos,
  getDispositivoBySerial,
  updateDispositivo,
  registrarCostoMantenimiento
} from "../services/api";
import "./css/Registrarsalida.css";
import Pagination from "../components/Pagination";
import TableSkeleton from "../components/TableSkeleton";
import { useLanguage } from "../context/LanguageContext.jsx";

function SalidaDispositivos() {
  const { t } = useLanguage();

  const translateTipo = (tipo) => {
    const map = {
      'Portatil': t('tipo_Portatil'),
      'Computadora': t('tipo_Computadora'),
      'Tablet': t('tipo_Tablet'),
      'Pantalla': t('tipo_Pantalla'),
      'Proyector': t('tipo_Proyector'),
      'Impresora': t('tipo_Impresora'),
    };
    return map[tipo] || tipo;
  };

  const translateEstado = (estado) => {
    const map = {
      'En Revision': t('estado_En_Revision'),
      'En Mantenimiento': t('estado_En_Mantenimiento'),
      'Listo para Entrega': t('estado_Listo_para_Entrega'),
      'Entregado': t('estado_Entregado'),
      'Disponible': t('estado_Disponible'),
    };
    return map[estado] || estado;
  };

  const [salidas, setSalidas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    serial: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    estado: ""
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const esSuperAdmin = (JSON.parse(localStorage.getItem('usuario') || '{}')).rol === 'super_admin';
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // ── Estado para el costo en la modal ──────────────────────────────────────
  const [costo, setCosto] = useState('');
  const [errorCosto, setErrorCosto] = useState('');
  // Dispositivo encontrado por serial (para mostrar info y nombre en modal)
  const [dispositivoEncontrado, setDispositivoEncontrado] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const res = await getDispositivos();
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      let todos = res.data;
      if (usuario.rol === 'tecnico') {
        todos = todos.filter(d => d.tecnico_id === usuario.id || String(d.tecnico_id) === String(usuario.id));
      }
      setSalidas(todos);
    } catch (error) {
      console.error("Error cargando:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirModal = () => {
    setEditandoId(null);
    setForm({
      serial: "",
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().slice(0, 5),
      estado: ""
    });
    setCosto('');
    setErrorCosto('');
    setDispositivoEncontrado(null);
    const modal = new Modal(document.getElementById('salidaModal'));
    modal.show();
  };

  const cerrarModal = () => {
    const modalEl = document.getElementById('salidaModal');
    const modal = Modal.getInstance(modalEl);
    if (modal) modal.hide();
  };

  const handleBuscar = async () => {
    if (!form.serial) return;
    try {
      const res = await getDispositivoBySerial(form.serial);
      const dispositivo = res.data;
      if (dispositivo) {
        setForm(prev => ({ ...prev, estado: dispositivo.estado }));
        setDispositivoEncontrado(dispositivo);
      }
    } catch (err) {
      console.error(err);
      setDispositivoEncontrado(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar costo antes de proceder
    const costoNum = parseFloat(costo);
    if (!costo || isNaN(costoNum) || costoNum < 0) {
      setErrorCosto(t('salida_modal_monto_invalido'));
      return;
    }

    setLoading(true);
    try {
      const res = await getDispositivoBySerial(form.serial);
      const dispositivo = res.data;

      if (!dispositivo) {
        alert(t('salida_disp_no_existe'));
        return;
      }

      if (dispositivo.estado !== "En Mantenimiento") {
        alert(t('salida_solo_mantenimiento'));
        return;
      }

      const ahora = new Date();
      const fecha = ahora.toISOString().split("T")[0];
      const hora  = ahora.toTimeString().slice(0, 5);

      // 1. Cambiar estado del dispositivo a "Listo para Entrega"
      await updateDispositivo(dispositivo.id, {
        estado: "Listo para Entrega",
        fecha_salida: fecha,
        hora_salida: hora
      });

      // 2. Registrar el costo en el mantenimiento activo del dispositivo
      try {
        await registrarCostoMantenimiento({
          dispositivo_id: dispositivo.id,
          costo: costoNum
        });
      } catch (err) {
        console.error('Error registrando costo:', err);
        // No fallar aquí — el dispositivo ya cambió de estado
        alert(t('error_registrar_costo') || 'Error registrando costo (continúa el flujo)');
      }

      cerrarModal();
      loadData();

    } catch (err) {
      console.error(err);
      alert(t('salida_err_registrar'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('salida_confirm_finalizar'))) {
      const dispositivo = salidas.find(d => d.id === id);
      if (!dispositivo) return;
      await updateDispositivo(id, {
        estado: "Disponible",
        fecha_salida: null,
        hora_salida: null
      });
      loadData();
    }
  };

  const handleEdit = (s) => {
    setForm({
      serial: s.serial,
      fecha: s.fecha_salida || new Date().toISOString().split("T")[0],
      hora: s.hora_salida || new Date().toTimeString().slice(0, 5),
      estado: s.estado || ""
    });
    setCosto('');
    setErrorCosto('');
    setDispositivoEncontrado(s);
    setEditandoId(s.id);
    const modal = new Modal(document.getElementById('salidaModal'));
    modal.show();
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Listo para Entrega': return 'badge-listo-entrega';
      case 'En Revision':        return 'badge-revision';
      case 'En Mantenimiento':   return 'badge-mantenimiento';
      case 'Entregado':          return 'badge-entregado';
      default:                   return 'badge-inactivo';
    }
  };

  const filteredSalidas = salidas.filter(s => {
    const okEstadoBase = s.estado === "En Mantenimiento";
    const texto = `${s.serial} ${s.nombre || ''} ${s.ubicacion || ''}`.toLowerCase();
    const okBusqueda = !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
    const okEstado = !filtroEstado || s.estado === filtroEstado;
    return okEstadoBase && okBusqueda && okEstado;
  });

  return (
    <div className="salida-wrapper">

      <div className="salida-banner">
        <div className="salida-banner-lines"></div>
        <div className="salida-banner-content">
          <h2>{t('salida_title')}</h2>
          <p>{t('salida_subtitle')}</p>
          <button className="salida-banner-btn" onClick={abrirModal}>
            {t('salida_btn_registrar')}
          </button>
        </div>
      </div>

      {/* ── MODAL ── */}
      <div className="modal fade" id="salidaModal" tabIndex="-1" aria-labelledby="salidaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title" id="salidaModalLabel">
                {editandoId ? t('salida_editar') : t('salida_modal_title')}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label={t('cerrar')}></button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit} id="salida-form">
                <div className="row g-3">

                  {/* Serial */}
                  <div className="col-12">
                    <label className="salida-modal-label">{t('salida_modal_serial')}</label>
                    <input
                      type="text"
                      name="serial"
                      value={form.serial}
                      onChange={handleChange}
                      onBlur={handleBuscar}
                      placeholder={t('salida_modal_serial_ph')}
                      required
                      className="salida-modal-input"
                      disabled={editandoId != null}
                    />
                  </div>

                  {/* Info del dispositivo encontrado */}
                  {dispositivoEncontrado && (
                    <div className="col-12">
                      <div style={{
                        background: 'var(--table-head)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '.75rem 1rem',
                        fontSize: '.78rem',
                        color: 'var(--text-main)',
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: '.35rem' }}>{dispositivoEncontrado.nombre}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>
                          {translateTipo(dispositivoEncontrado.tipo)} · {dispositivoEncontrado.serial}
                        </div>
                        <div style={{ marginTop: '.4rem' }}>
                          <span style={{
                            fontSize: '.68rem', fontWeight: 700,
                            padding: '2px 9px', borderRadius: '20px',
                            background: 'rgba(192,132,252,0.15)', color: '#c084fc'
                          }}>
                            {translateEstado(dispositivoEncontrado.estado)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Campo de costo — ahora en esta modal, no en GestionMantenimiento ── */}
                  <div className="col-12">
                    <label className="salida-modal-label">
                      {t('salida_modal_costo_label')} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      border: `1.5px solid ${errorCosto ? '#ef4444' : 'var(--border)'}`,
                      borderRadius: '10px',
                      background: 'var(--input-bg)',
                      overflow: 'hidden',
                      transition: 'border-color .2s',
                    }}>
                      <span style={{
                        padding: '0 .75rem', fontSize: '.95rem', fontWeight: 700,
                        color: '#0492C2', background: 'rgba(4,146,194,0.08)',
                        borderRight: '1.5px solid var(--border)',
                        alignSelf: 'stretch', display: 'flex', alignItems: 'center'
                      }}>$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={costo}
                        onChange={e => { setCosto(e.target.value); setErrorCosto(''); }}
                        className="salida-modal-input"
                        style={{ border: 'none', borderRadius: 0, flex: 1, background: 'transparent' }}
                      />
                      <span style={{
                        padding: '0 .75rem', fontSize: '.72rem', fontWeight: 600,
                        color: 'var(--text-muted)', background: 'rgba(4,146,194,0.05)',
                        borderLeft: '1.5px solid var(--border)',
                        alignSelf: 'stretch', display: 'flex', alignItems: 'center'
                      }}>COP</span>
                    </div>
                    {errorCosto && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginTop: '.4rem', fontSize: '.75rem', color: '#ef4444', fontWeight: 500 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        </svg>
                        {errorCosto}
                      </div>
                    )}
                    <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.5rem', lineHeight: 1.5 }}>
                      {t('salida_modal_costo_hint')}
                    </p>
                  </div>

                  <div className="col-12">
                    <label className="salida-modal-label">{t('salida_modal_info')}</label>
                    <p className="salida-info-text">
                      {t('salida_modal_info_desc')}
                    </p>
                  </div>

                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="salida-btn-cancel" data-bs-dismiss="modal">
                {t('cerrar')}
              </button>
              <button type="submit" form="salida-form" className="salida-btn-primary" disabled={loading}>
                {loading ? t('historial_guardando') : editandoId ? t('salida_btn_actualizar') : t('salida_btn_registrar')}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── TABLA ── */}
      <div className="salida-card">
        <div className="salida-card-title">
          <div className="salida-card-dot"></div>
          <span style={{ whiteSpace: 'nowrap' }}>{t('dash_lista_dispositivos')}</span>
          <input
            type="text"
            placeholder={t('salida_buscar_ph')}
            value={filtroBusqueda}
            onChange={e => { setFiltroBusqueda(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1, minWidth: '160px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none' }}
          />
          {(filtroBusqueda || filtroEstado) && (
            <button onClick={() => { setFiltroBusqueda(''); setFiltroEstado(''); }} style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
              {t('dash_limpiar')} ✕
            </button>
          )}
          <span className="salida-count">{salidas.length} {t('correo_registros')}</span>
        </div>

        <div className="salida-table-wrap">
          <table className="salida-table">
            <thead>
              <tr>
                <th>{t('dash_col_nombre')}</th>
                <th>{t('dash_col_serial')}</th>
                <th>{t('salida_col_fecha_ent')}</th>
                <th>{t('dash_col_estado')}</th>
                {esSuperAdmin && <th>{t('dash_col_reg_por')}</th>}
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <TableSkeleton rows={7} cols={esSuperAdmin ? 5 : 4} noWrapper />
              ) : filteredSalidas.length === 0 ? (
                <tr><td colSpan={esSuperAdmin ? 5 : 4} className="salida-empty">{t('salida_no_registros')}</td></tr>
              ) : (
                filteredSalidas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.82rem' }}>{s.nombre || '—'}</div>
                      <div style={{ fontSize: '.71rem', color: 'var(--text-muted)', marginTop: '1px' }}>{s.tipo || ''}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.serial}</td>
                    <td>
                      {s.fecha_registro
                        ? new Date(s.fecha_registro).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-'}
                      <br />
                      <span className="salida-hora">{s.hora_registro || new Date(s.fecha_registro).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td><span className={getBadgeClass(s.estado)}>{translateEstado(s.estado)}</span></td>
                    {esSuperAdmin && (
                      <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {s.registrado_por || '-'}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={filteredSalidas.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
}

export default SalidaDispositivos;
