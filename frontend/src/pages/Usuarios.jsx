import React, { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/api';
import { useLanguage } from '../context/LanguageContext.jsx';

function Usuarios() {
  const { t } = useLanguage();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '', rol: 'usuario' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getUsuarios();
    setUsuarios(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateUsuario(editingId, { nombre: form.nombre, correo: form.correo, rol: form.rol });
    } else {
      await createUsuario(form);
    }
    setForm({ nombre: '', correo: '', contrasena: '', rol: 'usuario' });
    setEditingId(null);
    loadData();
  };

  const handleEdit = (usuario) => {
    setForm({ nombre: usuario.nombre, correo: usuario.correo, contrasena: '', rol: usuario.rol });
    setEditingId(usuario.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('usu_eliminar_confirm'))) {
      await deleteUsuario(id);
      loadData();
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.6rem', color: 'var(--text-main)' }}>{t('usu_title')}</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{editingId ? t('equipo_editar_usuario') : t('usu_registrar_nuevo')}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>{t('usu_form_nombre')}</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="form-control" required />
          </div>
          <div>
            <label>{t('usu_form_correo')}</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} className="form-control" required />
          </div>
          {!editingId && (
            <div>
              <label>{t('usu_form_pass')}</label>
              <input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} className="form-control" required />
            </div>
          )}
          <div>
            <label>{t('usu_form_rol')}</label>
            <select name="rol" value={form.rol} onChange={handleChange} className="form-control" required>
              <option value="usuario">{t('usu_estandar')}</option>
              <option value="admin">{t('admin')}</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? t('usu_actualizar') : t('usu_registrar')}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={() => { setEditingId(null); setForm({ nombre: '', correo: '', contrasena: '', rol: 'usuario' }); }} style={{ marginLeft: '1rem' }}>
                {t('cancelar')}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>{t('equipo_lista_usuarios')}</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('dash_col_nombre')}</th>
                <th>{t('correo_col_correo')}</th>
                <th>{t('rol')}</th>
                <th>{t('equipo_col_acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.nombre}</strong></td>
                  <td>{u.correo}</td>
                  <td><span className={`badge ${u.rol === 'admin' ? 'badge-warning' : 'badge-success'}`}>{u.rol}</span></td>
                  <td>
                    <button className="btn" style={{ padding: '0.25rem 0.5rem', background: 'var(--border)', marginRight: '0.5rem' }} onClick={() => handleEdit(u)}>{t('editar')}</button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(u.id)}>{t('eliminar')}</button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>{t('usu_no_registrados')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;
