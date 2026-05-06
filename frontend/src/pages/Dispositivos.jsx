import React, { useState, useEffect, useRef } from 'react';
import { getDispositivos, createDispositivo, updateDispositivo, deleteDispositivo, getDispositivoBySerial } from '../services/api';
import { Modal } from 'bootstrap';
import './css/Dispositivos.css';
import Pagination from '../components/Pagination';
import TableSkeleton from '../components/TableSkeleton';
import { useLanguage } from '../context/LanguageContext.jsx';

const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function Dispositivos() {
  const { t } = useLanguage();
  const [dispositivos, setDispositivos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [form, setForm] = useState({
    nombre: '', tipo: '', serial: '', marca: '',
    ubicacion: '', estado: 'Disponible',
    fecha_registro: new Date().toISOString().split('T')[0],
    hora_registro: new Date().toTimeString().slice(0, 5),
    descripcion: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const modalRef = useRef(null);

  const [reingreso, setReingreso] = useState({
    serial: '', dispositivo: null, error: '', buscando: false, confirmando: false
  });
  const [loadingReingreso, setLoadingReingreso] = useState(false);

  // Modal eliminar + toast
  const [modalEliminar, setModalEliminar] = useState(null); // dispositivo a eliminar
  const [eliminando, setEliminando] = useState(false);
  const [toast, setToast] = useState(null);

  const mostrarToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const res = await getDispositivos();
      const usuarioActual = (JSON.parse(localStorage.getItem('usuario')||'{}'));
      const dispositivos = usuarioActual.rol === 'usuario'
        ? res.data.filter(d => d.usuario_id === usuarioActual.id)
        : res.data;
      setDispositivos(dispositivos);
    } catch (err) {
      console.error('Error cargando dispositivos:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const esSuperAdmin = (JSON.parse(localStorage.getItem('usuario')||'{}')).rol === 'super_admin';
  const [filtroBusqueda, setFiltroBusqueda] = React.useState('');
  const [filtroEstadoDisp, setFiltroEstadoDisp] = React.useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirModal = () => {
    setEditingId(null);
    setForm({
      nombre: '', tipo: '', serial: '', marca: '',
      ubicacion: '', estado: 'Disponible',
      fecha_registro: new Date().toISOString().split('T')[0],
      hora_registro: new Date().toTimeString().slice(0, 5),
      descripcion: ''
    });
    new Modal(document.getElementById('dispositivoModal')).show();
  };

  const cerrarModal = () => {
    const modal = Modal.getInstance(document.getElementById('dispositivoModal'));
    if (modal) modal.hide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      const ahora = new Date();
      formData.set('fecha_registro', ahora.toISOString().split('T')[0]);
      formData.set('hora_registro', ahora.toTimeString().slice(0, 5));
      if (!editingId) formData.set('estado', 'En Revisión');
      const archivo = document.getElementById('archivo');
      if (archivo && archivo.files[0]) formData.append('archivo', archivo.files[0]);
      if (editingId) {
        await updateDispositivo(editingId, formData);
      } else {
        await createDispositivo(formData);
      }
      cerrarModal();
      loadData();
    } catch (err) {
      console.error('Error guardando dispositivo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (d) => {
    setForm({
      nombre: d.nombre || '',
      tipo: d.tipo || '',
      serial: d.serial || '',
      marca: d.marca || '',
      ubicacion: d.ubicacion || '',
      estado: d.estado || 'Disponible',
      fecha_registro: d.fecha_registro ? d.fecha_registro.split('T')[0] : new Date().toISOString().split('T')[0],
      hora_registro: d.hora_registro || new Date().toTimeString().slice(0, 5),
      descripcion: d.descripcion || ''
    });
    setEditingId(d.id);
    new Modal(document.getElementById('dispositivoModal')).show();
  };

  const handleDelete = async (id) => {
    const dispositivo = dispositivos.find(d => d.id === id);
    if (dispositivo) setModalEliminar(dispositivo);
  };

  const confirmarEliminar = async () => {
    if (!modalEliminar) return;
    setEliminando(true);
    try {
      await deleteDispositivo(modalEliminar.id);
      mostrarToast(`"${modalEliminar.nombre}" movido a la papelera`);
      setModalEliminar(null);
      loadData();
    } catch {
      mostrarToast(t('disp_err_eliminar') || 'Error al eliminar el dispositivo', true);
    } finally {
      setEliminando(false);
    }
  };

  const abrirReingreso = () => {
    setReingreso({ serial: '', dispositivo: null, error: '', buscando: false, confirmando: false });
    new Modal(document.getElementById('reingresoModal')).show();
  };

  const cerrarReingreso = () => {
    const modal = Modal.getInstance(document.getElementById('reingresoModal'));
    if (modal) modal.hide();
  };

  const buscarPorSerial = async () => {
    if (!reingreso.serial.trim()) return;
    setReingreso(r => ({ ...r, buscando: true, dispositivo: null, error: '', confirmando: false }));
    try {
      const res = await getDispositivoBySerial(reingreso.serial.trim());
      setReingreso(r => ({ ...r, dispositivo: res.data, buscando: false, confirmando: true }));
    } catch {
      setReingreso(r => ({ ...r, error: t('disp_no_registrado'), buscando: false }));
    }
  };

  const confirmarReingreso = async () => {
    setLoadingReingreso(true);
    try {
      const ahora = new Date();
      await updateDispositivo(reingreso.dispositivo.id, {
        estado: 'En Revision',
        fecha_registro: ahora.toISOString().split('T')[0],
        hora_registro: ahora.toTimeString().slice(0, 5),
        fecha_salida: null,
        hora_salida: null,
      });
      cerrarReingreso();
      loadData();
    } catch {
      setReingreso(r => ({ ...r, error: t('disp_error_reingreso') }));
    } finally {
      setLoadingReingreso(false);
    }
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Listo para Entrega': return 'badge-listo-entrega';
      case 'En Revision':        return 'badge-revision';
      case 'En Mantenimiento':   return 'badge-mantenimiento';
      case 'Entregado':          return 'badge-entregado';
      default:                   return 'badge-revision';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="disp-wrap">
      {/* banner */}
      <div className="disp-banner">
        <div className="disp-banner-lines"></div>
        <div className="disp-banner-content">
          <h1 className="disp-banner-title">{t('disp_banner_titulo')}</h1>
          <p className="disp-banner-sub">{t('disp_banner_sub')}</p>
          <div className="disp-banner-btns">
            <button className="disp-banner-btn" onClick={abrirModal}>{t('agregar_dispositivo')}</button>
            <button className="disp-banner-btn-secondary" onClick={abrirReingreso}>
              <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={15} />
              {t('disp_reingresar')}
            </button>
          </div>
        </div>
      </div>

      {/* modal registrar / editar */}
      <div className="modal fade" id="dispositivoModal" tabIndex="-1" aria-hidden="true" ref={modalRef}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingId ? t('disp_editar') : t('disp_registrar_nuevo')}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} id="disp-form">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="disp-modal-label">{t('nombre_dispositivo')}</label>
                    <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                      placeholder="Ej: Portátil HP ProBook" required className="disp-modal-input" />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">{t('tipo_dispositivo')}</label>
                    <input type="text" name="tipo" value={form.tipo} onChange={handleChange}
                      placeholder="Ej: Portátil, Proyector..." required className="disp-modal-input" />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">{t('disp_serial')}</label>
                    <input type="text" name="serial" value={form.serial} onChange={handleChange}
                      placeholder="Ej: ABC-123456" required className="disp-modal-input"
                      disabled={editingId != null} />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">{t('disp_marca')}</label>
                    <input type="text" name="marca" value={form.marca} onChange={handleChange}
                      placeholder="Ej: HP, Dell, Epson..." required className="disp-modal-input" />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">{t('disp_ubicacion')}</label>
                    <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange}
                      placeholder="Ej: Aula 101" className="disp-modal-input" />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">{t('estado_dispositivo')}</label>
                    <input type="text" value={t('disp_en_revision')} disabled className="disp-modal-input" />
                  </div>
                  <div className="col-12">
                    <label className="disp-modal-label">{t('disp_descripcion')}</label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      placeholder="Ej: Pantalla rayada, teclado sin tecla Enter, cargador incluido..."
                      className="disp-modal-input"
                      rows={3}
                      style={{ resize: 'vertical', minHeight: '70px' }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="disp-modal-label">{t('disp_imagen')}</label>
                    <input type="file" id="archivo" accept="image/*" className="disp-modal-input" />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="disp-btn-cancel" data-bs-dismiss="modal">{t('cerrar')}</button>
              <button type="submit" form="disp-form" className="disp-btn-primary" disabled={loading}>
                {loading ? t('disp_guardando') : editingId ? t('disp_actualizar') : t('agregar_dispositivo')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* modal reingreso */}
      <div className="modal fade" id="reingresoModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content reingreso-modal-content">
            <div className="reingreso-modal-header">
              <span className="reingreso-modal-titulo">{t('disp_reingresar')}</span>
              <button type="button" className="reingreso-close" data-bs-dismiss="modal">
                <Icon d="M18 6L6 18M6 6l12 12" size={16} />
              </button>
            </div>
            <div className="reingreso-modal-body">
              <div className="reingreso-field">
                <label className="reingreso-label">{t('disp_serial_label')}</label>
                <div className="reingreso-serial-row">
                  <input type="text" className="reingreso-input" placeholder="Ej: ABC-123456"
                    value={reingreso.serial}
                    onChange={e => setReingreso(r => ({ ...r, serial: e.target.value, dispositivo: null, error: '', confirmando: false }))}
                    onKeyDown={e => e.key === 'Enter' && buscarPorSerial()} />
                  <button className="reingreso-btn-buscar" onClick={buscarPorSerial} disabled={reingreso.buscando}>
                    {reingreso.buscando ? '...' : t('buscar')}
                  </button>
                </div>
              </div>
              {reingreso.error && (
                <div className="reingreso-error">
                  <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={15} />
                  {reingreso.error}
                </div>
              )}
              {reingreso.dispositivo && (
                <div className="reingreso-info-card">
                  {[
                    { label: t('nombre_dispositivo'), value: reingreso.dispositivo.nombre },
                    { label: t('disp_marca'), value: reingreso.dispositivo.marca },
                    { label: t('disp_serial'), value: reingreso.dispositivo.serial },
                    { label: t('tipo_dispositivo'), value: reingreso.dispositivo.tipo },
                    { label: t('estado_dispositivo'), value: reingreso.dispositivo.estado },
                  ].map(({ label, value }) => (
                    <div key={label} className="reingreso-info-row">
                      <span className="reingreso-info-label">{label}</span>
                      <span className="reingreso-info-val">{value || '—'}</span>
                    </div>
                  ))}
                  {reingreso.dispositivo.descripcion && (
                    <div className="reingreso-info-row" style={{ flexDirection: 'column', gap: '3px' }}>
                      <span className="reingreso-info-label">{t('disp_descripcion')}</span>
                      <span className="reingreso-info-val" style={{ fontSize: '.78rem' }}>
                        {reingreso.dispositivo.descripcion}
                      </span>
                    </div>
                  )}
                  <div className="reingreso-confirm-msg">
                    {t('disp_confirmar_reingreso')}<br />
                    <span>{t('disp_estado_cambiara')} <strong>En Revisión</strong></span>
                  </div>
                </div>
              )}
            </div>
            <div className="reingreso-modal-footer">
              <button className="reingreso-btn-cancel" data-bs-dismiss="modal">{t('cerrar')}</button>
              {reingreso.confirmando && (
                <button className="reingreso-btn-confirm" onClick={confirmarReingreso} disabled={loadingReingreso}>
                  {loadingReingreso ? t('disp_procesando') : t('disp_confirmar_reingreso_btn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* tabla */}
      <div className="disp-card">
        <div className="disp-card-title">
          <div className="disp-card-dot"></div>
          <span style={{ whiteSpace: 'nowrap' }}>{t('disp_lista')}</span>
          <input
            type="text"
            placeholder={t('disp_buscar_placeholder')}
            value={filtroBusqueda}
            onChange={e => { setFiltroBusqueda(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1, minWidth: '160px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none' }}
          />
          <select
            value={filtroEstadoDisp}
            onChange={e => { setFiltroEstadoDisp(e.target.value); setCurrentPage(1); }}
            style={{ padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}
          >
            <option value="">{t('disp_todos_estados')}</option>
            <option value="En Revision">{t('dash_en_revision')}</option>
            <option value="En Mantenimiento">{t('dash_en_mantenimiento')}</option>
            <option value="Listo para Entrega">{t('dash_listo_entrega')}</option>
            <option value="Entregado">{t('dash_entregado')}</option>
          </select>
          {(filtroBusqueda || filtroEstadoDisp) && (
            <button onClick={() => { setFiltroBusqueda(''); setFiltroEstadoDisp(''); }} style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
              {t('limpiar_filtros')}
            </button>
          )}
          <span className="disp-count">{dispositivos.length} {t('disp_registrados')}</span>
        </div>
        <div className="disp-table-wrap">
          <table className="disp-table">
            <thead>
              <tr>
                <th>{t('dash_col_nombre')}</th>
                <th>{t('disp_serial')}</th>
                <th>{t('disp_marca')}</th>
                <th>{t('disp_ubicacion')}</th>
                <th>{t('disp_fecha_hora')}</th>
                <th>{t('estado_dispositivo')}</th>
                <th>{t('disp_acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <TableSkeleton rows={7} cols={7} />
              ) : (() => {
                const filtrados = dispositivos.filter(d => {
                  const texto = `${d.nombre} ${d.serial} ${d.marca}`.toLowerCase();
                  const okBusqueda = !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
                  const okEstado = !filtroEstadoDisp || d.estado === filtroEstadoDisp;
                  return okBusqueda && okEstado;
                });
                return filtrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(d => (
                <tr key={d.id}>
                  <td>
                    <div className="disp-dev-name">{d.nombre}</div>
                    <div className="disp-dev-type">{d.tipo}</div>
                  </td>
                  <td>{d.serial}</td>
                  <td>{d.marca}</td>
                  <td>{d.ubicacion || 'N/A'}</td>
                  <td>
                    {formatFecha(d.fecha_registro)}<br />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {d.hora_registro || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`disp-badge ${getBadgeClass(d.estado)}`}>{d.estado}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button className="disp-btn-edit" onClick={() => handleEdit(d)}>
                      <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      {t('editar')}
                    </button>
                    <button className="disp-btn-del" onClick={() => handleDelete(d.id)}>
                      <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      {t('eliminar')}
                    </button>
                    </div>
                  </td>
                </tr>
                ));
              })()}
              {!loadingData && dispositivos.filter(d => {
                const texto = `${d.nombre} ${d.serial} ${d.marca}`.toLowerCase();
                return (!filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase())) && (!filtroEstadoDisp || d.estado === filtroEstadoDisp);
              }).length === 0 && (
                <tr><td colSpan="7" className="disp-empty">{t('disp_sin_resultados')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalItems={dispositivos.filter(d => {
            const texto = `${d.nombre} ${d.serial} ${d.marca}`.toLowerCase();
            return (!filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase())) && (!filtroEstadoDisp || d.estado === filtroEstadoDisp);
          }).length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal confirmar eliminar */}
      {modalEliminar && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => setModalEliminar(null)}
        >
          <div
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#dc2626' }}>
              <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" size={28} />
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
              ¿Mover <strong>{modalEliminar.nombre}</strong> a la papelera?
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              El dispositivo podrá restaurarse desde el módulo de Papelera.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setModalEliminar(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {t('cancelar')}
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: eliminando ? 'not-allowed' : 'pointer', opacity: eliminando ? 0.7 : 1 }}
              >
                {eliminando ? 'Moviendo...' : 'Sí, mover a papelera'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', animation: 'slideUp 0.25s ease', background: toast.error ? '#fee2e2' : 'var(--text-main)', color: toast.error ? '#dc2626' : 'var(--bg-card)' }}>
          <Icon d={toast.error ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} size={16} />
          {toast.msg}
        </div>
      )}

    </div>
  );
}

export default Dispositivos;
