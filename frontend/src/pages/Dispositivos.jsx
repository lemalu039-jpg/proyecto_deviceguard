import React, { useState, useEffect, useRef } from 'react';
import { getDispositivos, createDispositivo, updateDispositivo, deleteDispositivo, getDispositivoBySerial } from '../services/api';
import { Modal } from 'bootstrap';
import './CSS/Dispositivos.css';
import Pagination from '../components/Pagination';

const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function Dispositivos() {
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
  const modalRef = useRef(null);

  const [reingreso, setReingreso] = useState({
    serial: '', dispositivo: null, error: '', buscando: false, confirmando: false
  });
  const [loadingReingreso, setLoadingReingreso] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await getDispositivos();
      const usuarioActual = (JSON.parse(localStorage.getItem('usuario')||'{}'));
      const dispositivos = usuarioActual.rol === 'usuario'
        ? res.data.filter(d => d.usuario_id === usuarioActual.id)
        : res.data;
      setDispositivos(dispositivos);
    } catch (err) {
      console.error('Error cargando dispositivos:', err);
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
      if (!editingId) formData.set('estado', 'En Revision');
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
    if (window.confirm('¿Seguro que deseas eliminar este dispositivo?')) {
      await deleteDispositivo(id);
      loadData();
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
      setReingreso(r => ({ ...r, error: 'El dispositivo no est� registrado', buscando: false }));
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
      setReingreso(r => ({ ...r, error: 'Error al reingresar el dispositivo' }));
    } finally {
      setLoadingReingreso(false);
    }
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Listo para Entrega': return 'badge-listo';
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
          <h1 className="disp-banner-title">Registra<br />Nuevos Dispositivos</h1>
          <p className="disp-banner-sub">Registra y guarda nuevos dispositivos en el sistema</p>
          <div className="disp-banner-btns">
            <button className="disp-banner-btn" onClick={abrirModal}>Registrar Dispositivo</button>
            <button className="disp-banner-btn-secondary" onClick={abrirReingreso}>
              <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={15} />
              Reingresar Dispositivo
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
                {editingId ? 'Editar dispositivo' : 'Registrar nuevo dispositivo'}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} id="disp-form">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="disp-modal-label">Nombre</label>
                    <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                      placeholder="Ej: Portatil HP ProBook" required className="disp-modal-input" />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">Tipo</label>
                    <input type="text" name="tipo" value={form.tipo} onChange={handleChange}
                      placeholder="Ej: Portatil, Proyector..." required className="disp-modal-input" />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">Serial</label>
                    <input type="text" name="serial" value={form.serial} onChange={handleChange}
                      placeholder="Ej: ABC-123456" required className="disp-modal-input"
                      disabled={editingId != null} />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">Marca</label>
                    <input type="text" name="marca" value={form.marca} onChange={handleChange}
                      placeholder="Ej: HP, Dell, Epson..." required className="disp-modal-input" />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">Ubicación</label>
                    <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange}
                      placeholder="Ej: Aula 101" className="disp-modal-input" />
                  </div>
                  <div className="col-md-6">
                    <label className="disp-modal-label">Estado</label>
                    <input type="text" value="En Revision" disabled className="disp-modal-input" />
                  </div>
                  <div className="col-12">
                    <label className="disp-modal-label">Descripcion del equipo</label>
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
                    <label className="disp-modal-label">Imagen del dispositivo</label>
                    <input type="file" id="archivo" accept="image/*" className="disp-modal-input" />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="disp-btn-cancel" data-bs-dismiss="modal">Cerrar</button>
              <button type="submit" form="disp-form" className="disp-btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editingId ? 'Actualizar dispositivo' : 'Registrar dispositivo'}
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
              <span className="reingreso-modal-titulo">Reingresar Dispositivo</span>
              <button type="button" className="reingreso-close" data-bs-dismiss="modal">
                <Icon d="M18 6L6 18M6 6l12 12" size={16} />
              </button>
            </div>
            <div className="reingreso-modal-body">
              <div className="reingreso-field">
                <label className="reingreso-label">Serial del dispositivo</label>
                <div className="reingreso-serial-row">
                  <input type="text" className="reingreso-input" placeholder="Ej: ABC-123456"
                    value={reingreso.serial}
                    onChange={e => setReingreso(r => ({ ...r, serial: e.target.value, dispositivo: null, error: '', confirmando: false }))}
                    onKeyDown={e => e.key === 'Enter' && buscarPorSerial()} />
                  <button className="reingreso-btn-buscar" onClick={buscarPorSerial} disabled={reingreso.buscando}>
                    {reingreso.buscando ? '...' : 'Buscar'}
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
                    { label: 'Nombre', value: reingreso.dispositivo.nombre },
                    { label: 'Marca', value: reingreso.dispositivo.marca },
                    { label: 'Serial', value: reingreso.dispositivo.serial },
                    { label: 'Tipo', value: reingreso.dispositivo.tipo },
                    { label: 'Estado actual', value: reingreso.dispositivo.estado },
                  ].map(({ label, value }) => (
                    <div key={label} className="reingreso-info-row">
                      <span className="reingreso-info-label">{label}</span>
                      <span className="reingreso-info-val">{value || '—'}</span>
                    </div>
                  ))}
                  {reingreso.dispositivo.descripcion && (
                    <div className="reingreso-info-row" style={{ flexDirection: 'column', gap: '3px' }}>
                      <span className="reingreso-info-label">Descripci�n</span>
                      <span className="reingreso-info-val" style={{ fontSize: '.78rem' }}>
                        {reingreso.dispositivo.descripcion}
                      </span>
                    </div>
                  )}
                  <div className="reingreso-confirm-msg">
                    �Deseas reingresar este dispositivo?<br />
                    <span>Su estado cambiar� a <strong>En Revisi�n</strong></span>
                  </div>
                </div>
              )}
            </div>
            <div className="reingreso-modal-footer">
              <button className="reingreso-btn-cancel" data-bs-dismiss="modal">Cerrar</button>
              {reingreso.confirmando && (
                <button className="reingreso-btn-confirm" onClick={confirmarReingreso} disabled={loadingReingreso}>
                  {loadingReingreso ? 'Procesando...' : 'Confirmar Reingreso'}
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
          <span>Lista de dispositivos</span>
          <input
            type="text"
            placeholder="Buscar por nombre, serial o marca..."
            value={filtroBusqueda}
            onChange={e => { setFiltroBusqueda(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1, minWidth: '180px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none' }}
          />
          <select
            value={filtroEstadoDisp}
            onChange={e => { setFiltroEstadoDisp(e.target.value); setCurrentPage(1); }}
            style={{ padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}
          >
            <option value="">Todos los estados</option>
            <option value="En Revision">En Revision</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
            <option value="Listo para Entrega">Listo para Entrega</option>
            <option value="Entregado">Entregado</option>
          </select>
          {(filtroBusqueda || filtroEstadoDisp) && (
            <button onClick={() => { setFiltroBusqueda(''); setFiltroEstadoDisp(''); }} style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
              Limpiar
            </button>
          )}
        </div>
        <div className="disp-table-wrap">
          <table className="disp-table">
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>Serial</th>
                <th>Marca</th>
                <th>Ubicación</th>
                <th>Fecha / Hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
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
                      Editar
                    </button>
                    <button className="disp-btn-del" onClick={() => handleDelete(d.id)}>
                      <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      Eliminar
                    </button>
                    </div>
                  </td>
                </tr>
                ));
              })()}
              {dispositivos.filter(d => {
                const texto = `${d.nombre} ${d.serial} ${d.marca}`.toLowerCase();
                return (!filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase())) && (!filtroEstadoDisp || d.estado === filtroEstadoDisp);
              }).length === 0 && (
                <tr><td colSpan="7" className="disp-empty">No hay dispositivos que coincidan con los filtros</td></tr>
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

    </div>
  );
}

export default Dispositivos;
