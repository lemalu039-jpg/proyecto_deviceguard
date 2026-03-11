import React, { useState, useEffect } from 'react';
import { getDispositivos, createDispositivo, updateDispositivo, deleteDispositivo } from '../services/api';

function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState({ nombre: '', tipo: '', serial: '', marca: '', modelo: '', ubicacion: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getDispositivos();
    setDispositivos(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateDispositivo(editingId, form);
    } else {
      await createDispositivo(form);
    }
    setForm({ nombre: '', tipo: '', serial: '', marca: '', modelo: '', ubicacion: '' });
    setEditingId(null);
    loadData();
  };

  const handleEdit = (dispositivo) => {
    setForm(dispositivo);
    setEditingId(dispositivo.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este dispositivo?')) {
      await deleteDispositivo(id);
      loadData();
    }
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Disponible': return 'badge-success';
      case 'En Prestamo': return 'badge-warning';
      case 'En Mantenimiento': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.875rem' }}>Gestión de Dispositivos</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Editar Dispositivo' : 'Registrar Nuevo Dispositivo'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Nombre:</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="form-control" required />
          </div>
          <div>
            <label>Tipo:</label>
            <input type="text" name="tipo" value={form.tipo} onChange={handleChange} className="form-control" required />
          </div>
          <div>
            <label>Serial:</label>
            <input type="text" name="serial" value={form.serial} onChange={handleChange} className="form-control" required disabled={editingId != null} />
          </div>
          <div>
            <label>Marca:</label>
            <input type="text" name="marca" value={form.marca} onChange={handleChange} className="form-control" required />
          </div>
          <div>
            <label>Modelo:</label>
            <input type="text" name="modelo" value={form.modelo} onChange={handleChange} className="form-control" required />
          </div>
          <div>
            <label>Ubicación:</label>
            <input type="text" name="ubicacion" value={form.ubicacion || ''} onChange={handleChange} className="form-control" />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Actualizar Dispositivo' : 'Registrar Dispositivo'}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={() => { setEditingId(null); setForm({ nombre: '', tipo: '', serial: '', marca: '', modelo: '', ubicacion: '' }); }} style={{ marginLeft: '1rem' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Lista de Dispositivos</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Serial</th>
                <th>Marca/Modelo</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dispositivos.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.nombre}</strong><br/><span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{d.tipo}</span></td>
                  <td>{d.serial}</td>
                  <td>{d.marca} {d.modelo}</td>
                  <td>{d.ubicacion || 'N/A'}</td>
                  <td><span className={`badge ${getBadgeClass(d.estado)}`}>{d.estado}</span></td>
                  <td>
                    <button className="btn" style={{ padding: '0.25rem 0.5rem', background: '#e2e8f0', marginRight: '0.5rem' }} onClick={() => handleEdit(d)}>Editar</button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(d.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {dispositivos.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No hay dispositivos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dispositivos;
