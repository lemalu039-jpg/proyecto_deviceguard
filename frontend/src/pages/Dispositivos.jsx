import React, { useState, useEffect } from 'react';
import { getDispositivos, createDispositivo, updateDispositivo, deleteDispositivo } from '../services/api';
import './CSS/Dispositivos.css';

function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    tipo: '',
    serial: '',
    marca: '',
    modelo: '',
    ubicacion: '',
    estado: 'Disponible'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateDispositivo(editingId, form);
      } else {
        await createDispositivo(form);
      }
      resetForm();
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
      modelo: d.modelo || '',
      ubicacion: d.ubicacion || '',
      estado: d.estado || 'Disponible'
    });
    setEditingId(d.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este dispositivo?')) {
      await deleteDispositivo(id);
      loadData();
    }
  };

  const resetForm = () => {
    setForm({ nombre: '', tipo: '', serial: '', marca: '', modelo: '', ubicacion: '', estado: 'Disponible' });
    setEditingId(null);
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Disponible':        return 'badge-disponible';
      case 'En Prestamo':       return 'badge-prestamo';
      case 'En Mantenimiento':  return 'badge-mantenimiento';
      default:                  return 'badge-inactivo';
    }
  };

  return (
    <div className="disp-wrap">
      <h1 className="disp-title">Gestión de Dispositivos</h1>

      <div className="disp-card">
        <div className="disp-card-title">
          <div className="disp-card-dot"></div>
          <span>{editingId ? 'Editar dispositivo' : 'Registrar nuevo dispositivo'}</span>
        </div>

        <form onSubmit={handleSubmit} className="disp-form-grid">

          <div className="disp-group">
            <label>Nombre</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Portátil HP ProBook" required />
          </div>

          <div className="disp-group">
            <label>Tipo</label>
            <input type="text" name="tipo" value={form.tipo} onChange={handleChange} placeholder="Ej: Portátil, Proyector..." required />
          </div>

          <div className="disp-group">
            <label>Serial</label>
            <input type="text" name="serial" value={form.serial} onChange={handleChange} placeholder="Ej: ABC-123456" required disabled={editingId != null} />
          </div>

          <div className="disp-group">
            <label>Marca</label>
            <input type="text" name="marca" value={form.marca} onChange={handleChange} placeholder="Ej: HP, Dell, Epson..." required />
          </div>

          <div className="disp-group">
            <label>Modelo</label>
            <input type="text" name="modelo" value={form.modelo} onChange={handleChange} placeholder="Ej: ProBook 450 G8" required />
          </div>

          <div className="disp-group">
            <label>Ubicación</label>
            <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Aula 101" />
          </div>

          {editingId && (
            <div className="disp-group">
              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange}>
                <option value="Disponible">Disponible</option>
                <option value="En Prestamo">En Préstamo</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          )}

          <div className="disp-span2">
            <div className="disp-btn-row">
              <button type="submit" className="disp-btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editingId ? 'Actualizar dispositivo' : 'Registrar dispositivo'}
              </button>
              {editingId && (
                <button type="button" className="disp-btn-cancel" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </div>

        </form>
      </div>

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
                <th>Marca / Modelo</th>
                <th>Ubicación</th>
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
                  <td>{d.marca} {d.modelo}</td>
                  <td>{d.ubicacion || 'N/A'}</td>
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
                  <td colSpan="6" className="disp-empty">No hay dispositivos registrados</td>
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
