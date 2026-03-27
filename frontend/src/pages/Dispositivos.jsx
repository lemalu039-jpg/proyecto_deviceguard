import React, { useState, useEffect, useRef } from 'react';
import { getDispositivos, createDispositivo, updateDispositivo, deleteDispositivo } from '../services/api';
import { Modal } from 'bootstrap';
import './CSS/Dispositivos.css';

function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    tipo: '',
    serial: '',
    marca: '',
    ubicacion: '',
    estado: 'Disponible',
    fecha_registro: new Date().toISOString().split('T')[0],
    hora_registro: new Date().toTimeString().slice(0, 5)
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

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

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Disponible':       return 'badge-disponible';
      case 'En Revision':      return 'badge-revision';
      case 'En Mantenimiento': return 'badge-mantenimiento';
      case 'Dado de Baja':     return 'badge-baja';
      default:                 return 'badge-inactivo';
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
          <button className="disp-banner-btn" onClick={abrirModal}>
            Registrar Dispositivo
          </button>
        </div>
      </div>

      {/* modal Bootstrap */}
      <div className="modal fade" id="dispositivoModal" tabIndex="-1" aria-labelledby="dispositivoModalLabel" aria-hidden="true" ref={modalRef}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>

            <div className="modal-header" style={{ background: '#151E3D', borderRadius: '12px 12px 0 0', borderBottom: 'none' }}>
              <h5 className="modal-title" id="dispositivoModalLabel" style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
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
                    <select name="estado" value={form.estado} onChange={handleChange} className="disp-modal-input">
                      <option value="Disponible">Disponible</option>
                      <option value="En Revision">En Revisión</option>
                      <option value="En Mantenimiento">En Mantenimiento</option>
                      <option value="Dado de Baja">Dado de Baja</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="disp-modal-label">Fecha de registro</label>
                    <input type="date" name="fecha_registro" value={form.fecha_registro}
                      onChange={handleChange} required className="disp-modal-input" />
                  </div>

                  <div className="col-md-6">
                    <label className="disp-modal-label">Hora de registro</label>
                    <input type="time" name="hora_registro" value={form.hora_registro}
                      onChange={handleChange} required className="disp-modal-input" />
                  </div>

                  <div className="col-12">
                    <label className="disp-modal-label">Imagen del dispositivo</label>
                    <input type="file" id="archivo" accept="image/*" className="disp-modal-input" />
                  </div>

                </div>
              </form>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '1rem 1.5rem' }}>
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
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {d.hora_registro || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`disp-badge ${getBadgeClass(d.estado)}`}>
                      {d.estado}
                    </span>
                  </td>
                  <td>
                    <button className="disp-btn-edit" onClick={() => handleEdit(d)}>Editar</button>
                    <button className="disp-btn-del" onClick={() => handleDelete(d.id)}>Eliminar</button>
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
