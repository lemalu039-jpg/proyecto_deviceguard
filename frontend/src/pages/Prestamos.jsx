import React, { useState, useEffect } from 'react';
import { getPrestamos, createPrestamo, updatePrestamo, deletePrestamo, getUsuarios, getDispositivos } from '../services/api';
import { useLanguage } from '../context/LanguageContext.jsx';

function Prestamos() {
  const { t } = useLanguage();
  const [prestamos, setPrestamos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  
  const [form, setForm] = useState({ usuario_id: '', dispositivo_id: '', estado_prestamo: 'Activo' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prestRes, usuRes, dispRes] = await Promise.all([
      getPrestamos(),
      getUsuarios(),
      getDispositivos()
    ]);
    setPrestamos(prestRes.data);
    setUsuarios(usuRes.data);
    setDispositivos(dispRes.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      // Solo permitimos actualizar el estado (Devolver, etc)
      await updatePrestamo(editingId, { estado_prestamo: form.estado_prestamo });
    } else {
      await createPrestamo(form);
    }
    setForm({ usuario_id: '', dispositivo_id: '', estado_prestamo: 'Activo' });
    setEditingId(null);
    loadData(); // This will fetch again so device stock update is visible
  };

  const handleEdit = (p) => {
    setForm({ usuario_id: p.usuario_id, dispositivo_id: p.dispositivo_id, estado_prestamo: p.estado_prestamo });
    setEditingId(p.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('prestamo_eliminar_confirm'))) {
      await deletePrestamo(id);
      loadData();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.6rem', color: 'var(--text-main)' }}>{t('prestamo_title')}</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{editingId ? t('prestamo_actualizar_estado') : t('prestamo_registrar_nuevo')}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>{t('prestamo_usuario')}</label>
            <select name="usuario_id" value={form.usuario_id} onChange={handleChange} className="form-control" required disabled={editingId != null}>
              <option value="">{t('prestamo_selecciona_usuario')}</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} - {u.correo}</option>)}
            </select>
          </div>
          <div>
            <label>{t('mant_form_dispositivo')}</label>
            <select name="dispositivo_id" value={form.dispositivo_id} onChange={handleChange} className="form-control" required disabled={editingId != null}>
              <option value="">{t('mant_selecciona_disp')}</option>
              {/* Para nuevos prestamos solo mostramos los disponibles. Si editamos mostramos el actual. */}
              {dispositivos.filter(d => editingId || d.estado === 'Disponible').map(d => (
                <option key={d.id} value={d.id}>{d.nombre} ({d.serial})</option>
              ))}
            </select>
          </div>
          
          {editingId && (
            <div>
              <label>{t('prestamo_estado_prestamo')}</label>
              <select name="estado_prestamo" value={form.estado_prestamo} onChange={handleChange} className="form-control" required>
                <option value="Activo">{t('prestamo_activo')}</option>
                <option value="Devuelto">{t('prestamo_devuelto')}</option>
                <option value="Atrasado">{t('prestamo_atrasado')}</option>
              </select>
            </div>
          )}

          <div style={{ gridColumn: 'span 2' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? t('prestamo_btn_actualizar') : t('prestamo_btn_registrar')}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={() => { setEditingId(null); setForm({ usuario_id: '', dispositivo_id: '', estado_prestamo: 'Activo' }); }} style={{ marginLeft: '1rem' }}>
                {t('cancelar')}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>{t('prestamo_historial')}</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('mant_col_disp')}</th>
                <th>{t('equipo_col_usuario')}</th>
                <th>{t('prestamo_col_fecha_prestamo')}</th>
                <th>{t('prestamo_col_fecha_devolucion')}</th>
                <th>{t('dash_col_estado')}</th>
                <th>{t('equipo_col_acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {prestamos.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.dispositivo_nombre}</strong><br/><span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{p.dispositivo_serial}</span></td>
                  <td>{p.usuario_nombre}</td>
                  <td>
                    {p.fecha_prestamo ? (
                      <>
                        <span>{new Date(p.fecha_prestamo).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <br />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{new Date(p.fecha_prestamo).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    ) : 'N/A'}
                  </td>
                  <td>
                    {p.fecha_devolucion ? (
                      <>
                        <span>{new Date(p.fecha_devolucion).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <br />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{new Date(p.fecha_devolucion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge ${p.estado_prestamo === 'Activo' ? 'badge-warning' : p.estado_prestamo === 'Devuelto' ? 'badge-success' : 'badge-danger'}`}>
                      {p.estado_prestamo}
                    </span>
                  </td>
                  <td>
                    {p.estado_prestamo !== 'Devuelto' && (
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', background: 'var(--border)', marginRight: '0.5rem' }} onClick={() => handleEdit(p)}>{t('prestamo_resolver')}</button>
                    )}
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(p.id)}>{t('eliminar')}</button>
                  </td>
                </tr>
              ))}
              {prestamos.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>{t('prestamo_no_registrados')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Prestamos;
