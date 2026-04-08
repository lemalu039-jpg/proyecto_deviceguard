import React, { useState, useEffect } from 'react';
import { getMantenimientos, createMantenimiento, updateMantenimiento, deleteMantenimiento, getDispositivos } from '../services/api';

function Mantenimiento() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  
  const [form, setForm] = useState({ dispositivo_id: '', descripcion: '', costo: 0, estado_mantenimiento: 'En Proceso' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [mantRes, dispRes] = await Promise.all([
      getMantenimientos(),
      getDispositivos()
    ]);
    setMantenimientos(mantRes.data);
    setDispositivos(dispRes.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateMantenimiento(editingId, { 
        descripcion: form.descripcion, 
        costo: form.costo, 
        estado_mantenimiento: form.estado_mantenimiento 
      });
    } else {
      await createMantenimiento(form);
    }
    setForm({ dispositivo_id: '', descripcion: '', costo: 0, estado_mantenimiento: 'En Proceso' });
    setEditingId(null);
    loadData();
  };

  const handleEdit = (m) => {
    setForm({ 
      dispositivo_id: m.dispositivo_id, 
      descripcion: m.descripcion, 
      costo: m.costo, 
      estado_mantenimiento: m.estado_mantenimiento 
    });
    setEditingId(m.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este registro de mantenimiento?')) {
      await deleteMantenimiento(id);
      loadData();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.875rem' }}>Mantenimiento de Dispositivos</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Actualizar Mantenimiento' : 'Registrar Nuevo Mantenimiento'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label>Dispositivo:</label>
            <select name="dispositivo_id" value={form.dispositivo_id} onChange={handleChange} className="form-control" required disabled={editingId != null}>
              <option value="">Selecciona un dispositivo</option>
              {dispositivos.map(d => (
                <option key={d.id} value={d.id}>{d.nombre} ({d.serial}) - {d.estado}</option>
              ))}
            </select>
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label>Descripción / Fallo reportado:</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="form-control" rows="3" required />
          </div>

          {editingId && (
            <>
              <div>
                <label>Costo Estimado/Final ($):</label>
                <input type="number" step="0.01" name="costo" value={form.costo} onChange={handleChange} className="form-control" />
              </div>
              <div>
                <label>Estado del Mantenimiento:</label>
                <select name="estado_mantenimiento" value={form.estado_mantenimiento} onChange={handleChange} className="form-control" required>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </>
          )}

          <div style={{ gridColumn: 'span 2' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Guardar Cambios' : 'Registrar Ingreso Mantenimiento'}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={() => { setEditingId(null); setForm({ dispositivo_id: '', descripcion: '', costo: 0, estado_mantenimiento: 'En Proceso' }); }} style={{ marginLeft: '1rem' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Historial de Mantenimientos</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>Descripción</th>
                <th>Costos</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mantenimientos.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.dispositivo_nombre}</strong><br/><span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{m.dispositivo_serial}</span></td>
                  <td>{m.descripcion}</td>
                  <td>${m.costo}</td>
                  <td>
                    <div style={{fontSize: '0.875rem'}}>
                      <strong>Inicio: </strong>{formatDate(m.fecha_inicio)}<br/>
                      <strong>Fin: </strong>{formatDate(m.fecha_fin)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${m.estado_mantenimiento === 'Completado' ? 'badge-success' : m.estado_mantenimiento === 'En Proceso' ? 'badge-warning' : 'badge-danger'}`}>
                      {m.estado_mantenimiento}
                    </span>
                  </td>
                  <td>
                    <button className="btn" style={{ padding: '0.25rem 0.5rem', background: 'var(--border)', marginRight: '0.5rem', marginBottom: '0.5rem' }} onClick={() => handleEdit(m)}>Ver/Editar</button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(m.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {mantenimientos.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No hay registros de mantenimiento</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Mantenimiento;
