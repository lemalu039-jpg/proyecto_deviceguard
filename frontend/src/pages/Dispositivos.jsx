import React, { useState, useEffect, useRef } from 'react';
import { getDispositivos, createDispositivo, updateDispositivo, deleteDispositivo, getDispositivoBySerial } from '../services/api';
import { Modal } from 'bootstrap';
import './CSS/Dispositivos.css';

const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState({
    nombre: '', tipo: '', serial: '', marca: '',
    ubicacion: '', estado: 'Disponible',
    fecha_registro: new Date().toISOString().split('T')[0],
    hora_registro: new Date().toTimeString().slice(0, 5)
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  // — Reingreso —
  const [reingreso, setReingreso] = useState({ serial: '', dispositivo: null, error: '', buscando: false, confirmando: false });
  const [loadingReingreso, setLoadingReingreso] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getDispositivos();
      setDispositivos(res.data);
    } catch (err) {
      console.error('Error cargando dispositivos:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirModal = () => {
    setEditingId(null);
    setForm({
      nombre: '', tipo: '', serial: '', marca: '',
      ubicacion: '', estado: 'Disponible',
      fecha_registro: new Date().toISOString().split('T')[0],
      hora_registro: new Date().toTimeString().slice(0, 5)
    });
    const modal = new Modal(document.getElementById('dispositivoModal'));
    modal.show();
  };

  const cerrarModal = () => {
    const modalEl = document.getElementById('dispositivoModal');
    const modal = Modal.getInstance(modalEl);
    if (modal) modal.hide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });
      const ahora = new Date();
      formData.set("fecha_registro", ahora.toISOString().split("T")[0]);
      formData.set("hora_registro", ahora.toTimeString().slice(0, 5));
      formData.set("estado", "En Revision"); // automático 
      const archivo = document.getElementById('archivo');
      if (archivo && archivo.files[0]) {
        formData.append('archivo', archivo.files[0]);
      }
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
      fecha_registro: d.fecha_registro
        ? d.fecha_registro.split('T')[0]
        : new Date().toISOString().split('T')[0],
      hora_registro: d.hora_registro || new Date().toTimeString().slice(0, 5)
    });
    setEditingId(d.id);
    const modal = new Modal(document.getElementById('dispositivoModal'));
    modal.show();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este dispositivo?')) {
      await deleteDispositivo(id);
      loadData();
    }
  };

  // — Funciones de reingreso —
  const abrirReingreso = () => {
    setReingreso({ serial: '', dispositivo: null, error: '', buscando: false, confirmando: false });
    const modal = new Modal(document.getElementById('reingresoModal'));
    modal.show();
  };

  const cerrarReingreso = () => {
    const modalEl = document.getElementById('reingresoModal');
    const modal = Modal.getInstance(modalEl);
    if (modal) modal.hide();
  };

  const buscarPorSerial = async () => {
    if (!reingreso.serial.trim()) return;
    setReingreso(r => ({ ...r, buscando: true, dispositivo: null, error: '' }));
    try {
      const res = await getDispositivoBySerial(reingreso.serial.trim());
      setReingreso(r => ({ ...r, dispositivo: res.data, buscando: false, confirmando: true }));
    } catch {
      setReingreso(r => ({ ...r, error: 'El dispositivo no está registrado', buscando: false, confirmando: false }));
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
      case 'Listo para Entrega':       return 'badge-listo para-entrega';
      case 'En Revision':      return 'badge-revision';
      case 'En Mantenimiento': return 'badge-mantenimiento';
      case 'Entregado':        return 'badge-entregado';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="disp-wrap">

      {/* banner */}
      <div className="disp-banner">
        <div className="disp-banner-lines"></div>
        <div className="disp-banner-content">
          <h1 className="disp-banner-title">
            Registra<br />Nuevos Dispositivos
          </h1>
          <p className="disp-banner-sub">Registra y guarda nuevos dispositivos en el sistema</p>
          <div className="disp-banner-btns">
            <button className="disp-banner-btn" onClick={abrirModal}>
              Registrar Dispositivo
            </button>
            <button className="disp-banner-btn-secondary" onClick={abrirReingreso}>
              <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={15} />
              Reingresar Dispositivo
            </button>
          </div>
        </div>
      </div>

      {/* modal Bootstrap */}
      <div className="modal fade" id="dispositivoModal" tabIndex="-1" aria-labelledby="dispositivoModalLabel" aria-hidden="true" ref={modalRef}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>

            <div className="modal-header" style={{ background: '#151E3D', borderRadius: '12px 12px 0 0', borderBottom: 'none' }}>
              <h5 className="modal-title" id="dispositivoModalLabel" style={{ color: 'var(--bg-card)', fontWeight: 700, fontSize: '1rem' }}>
                {editingId ? 'Editar dispositivo' : 'Registrar nuevo dispositivo'}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleSubmit} id="disp-form">
                <div className="row g-3">

                  <div className="col-md-6">
                    <label className="disp-modal-label">Nombre</label>
                    <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                      placeholder="Ej: Portátil HP ProBook" required className="disp-modal-input" />
                  </div>

                  <div className="col-md-6">
                    <label className="disp-modal-label">Tipo</label>
                    <input type="text" name="tipo" value={form.tipo} onChange={handleChange}
                      placeholder="Ej: Portátil, Proyector..." required className="disp-modal-input" />
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
                    <input
                      type="text"
                      value="En Revisión"
                      disabled
                      className="disp-modal-input"
                     />
                  </div>
                  
                  <div className="col-12">
                    <label className="disp-modal-label">Imagen del dispositivo</label>
                    <input type="file" id="archivo" accept="image/*" className="disp-modal-input" />
                  </div>

                </div>
              </form>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.5rem' }}>
              <button type="button" className="disp-btn-cancel" data-bs-dismiss="modal">
                Cerrar
              </button>
              <button type="submit" form="disp-form" className="disp-btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editingId ? 'Actualizar dispositivo' : 'Registrar dispositivo'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* modal Reingreso */}
      <div className="modal fade" id="reingresoModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content reingreso-modal-content">

            <div className="reingreso-modal-header">
              <span className="reingreso-modal-titulo">Reingresar Dispositivo</span>
              <button type="button" className="reingreso-close" data-bs-dismiss="modal" aria-label="Cerrar">
                <Icon d="M18 6L6 18M6 6l12 12" size={16} />
              </button>
            </div>

            <div className="reingreso-modal-body">

              {/* Campo serial */}
              <div className="reingreso-field">
                <label className="reingreso-label">SERIAL DEL DISPOSITIVO</label>
                <div className="reingreso-serial-row">
                  <input
                    type="text"
                    className="reingreso-input"
                    placeholder="Ej: ABC-123456"
                    value={reingreso.serial}
                    onChange={e => setReingreso(r => ({ ...r, serial: e.target.value, dispositivo: null, error: '', confirmando: false }))}
                    onKeyDown={e => e.key === 'Enter' && buscarPorSerial()}
                  />
                  <button className="reingreso-btn-buscar" onClick={buscarPorSerial} disabled={reingreso.buscando}>
                    {reingreso.buscando ? '...' : 'Buscar'}
                  </button>
                </div>
              </div>

              {/* Error */}
              {reingreso.error && (
                <div className="reingreso-error">
                  <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={15} />
                  {reingreso.error}
                </div>
              )}

              {/* Datos del dispositivo encontrado */}
              {reingreso.dispositivo && (
                <div className="reingreso-info-card">
                  <div className="reingreso-info-row">
                    <span className="reingreso-info-label">Nombre</span>
                    <span className="reingreso-info-val">{reingreso.dispositivo.nombre}</span>
                  </div>
                  <div className="reingreso-info-row">
                    <span className="reingreso-info-label">Marca</span>
                    <span className="reingreso-info-val">{reingreso.dispositivo.marca}</span>
                  </div>
                  <div className="reingreso-info-row">
                    <span className="reingreso-info-label">Tipo</span>
                    <span className="reingreso-info-val">{reingreso.dispositivo.tipo}</span>
                  </div>
                  <div className="reingreso-info-row">
                    <span className="reingreso-info-label">Estado actual</span>
                    <span className="reingreso-info-val">{reingreso.dispositivo.estado}</span>
                  </div>
                  <div className="reingreso-confirm-msg">
                    ¿Deseas reingresar este dispositivo al sistema?<br />
                    <span>Su estado cambiará a <strong>En Revisión</strong></span>
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
          <span className="disp-count">{dispositivos.length} registrados</span>
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
              {dispositivos.map(d => (
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
                    <span className={`disp-badge ${getBadgeClass(d.estado)}`}>
                      {d.estado}
                    </span>
                  </td>
                  <td>
                    <button className="disp-btn-edit" onClick={() => handleEdit(d)}>
                      <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      Editar
                    </button>
                    <button className="disp-btn-del" onClick={() => handleDelete(d.id)}>
                      <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {dispositivos.length === 0 && (
                <tr>
                  <td colSpan="7" className="disp-empty">No hay dispositivos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Dispositivos;
