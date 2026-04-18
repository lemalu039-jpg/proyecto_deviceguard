import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHistorial, createObservacion } from '../services/api';
import './CSS/HistorialDispositivo.css';

function HistorialDispositivo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ dispositivo: null, historial: [], mantenimientos: [] });
  const [loading, setLoading] = useState(true);
  const [nuevaObservacion, setNuevaObservacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [usuario, setUsuario] = useState('Usuario');
  const [rolUsuario, setRolUsuario] = useState('');

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('usuario'));
      if (u && u.nombre) setUsuario(u.nombre);
      if (u && u.rol) setRolUsuario(u.rol);
    } catch {}
  }, []);

  const loadHistorial = async () => {
    try {
      const res = await getHistorial(id);
      setData(res.data);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, [id]);

  const handleAgregar = async () => {
    if (!nuevaObservacion.trim()) return;
    setGuardando(true);
    try {
      await createObservacion(id, {
        observacion: nuevaObservacion,
        usuario_responsable: usuario
      });
      setNuevaObservacion('');
      await loadHistorial();
    } catch (error) {
      console.error('Error guardando observación:', error);
      alert('Error al guardar la observación');
    } finally {
      setGuardando(false);
    }
  };

  const getBadgeStyle = (estado) => {
    const base = { display: 'inline-block', fontSize: '.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' };
    switch (estado) {
      case 'Listo para Entrega':       return { ...base, background: '#fcfbdc', color: '#dacd1c' };
      case 'En Revision':      return { ...base, background: '#f3e8ff', color: '#7e22ce' };
      case 'En Mantenimiento': return { ...base, background: '#ffedd5', color: '#c2410c' };
      case 'Entregado':        return { ...base, background: '#f3fef2', color: '#15803d' };
      default:                 return { ...base, background: 'var(--input-bg)', color: 'var(--text-muted)' };
    }
  };

  if (loading) return <div className="historial-container"><p>Cargando información del equipo...</p></div>;
  if (!data.dispositivo) return <div className="historial-container"><p>No se encontró el dispositivo.</p></div>;

  const { dispositivo, historial, mantenimientos } = data;
  const puedeVerMantenimientos = rolUsuario === 'tecnico' || rolUsuario === 'super_admin';

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h1 className="historial-title">Historial de Equipo</h1>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Volver al Dashboard
        </button>
      </div>

      <div className="info-card">
        <div className="info-item">
          <span className="info-label">Nombre / Modelo</span>
          <span className="info-value">{dispositivo.nombre}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Serial</span>
          <span className="info-value" style={{ fontFamily: 'monospace' }}>{dispositivo.serial}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Ubicación</span>
          <span className="info-value">{dispositivo.ubicacion || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Estado Actual</span>
          <div style={{ marginTop: '5px' }}>
            <span style={getBadgeStyle(dispositivo.estado)}>{dispositivo.estado}</span>
          </div>
        </div>
      </div>

      {puedeVerMantenimientos && (
        <div className="history-section">
          <h2 className="history-title">Historial de Mantenimientos</h2>
          {mantenimientos.length === 0 ? (
            <div className="empty-state">No hay registros de mantenimiento para este equipo.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--table-head)', borderBottom: '2px solid var(--border)' }}>
                  {['Técnico', 'Descripción', 'Estado', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '.65rem 1rem', textAlign: 'left', fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mantenimientos.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--table-stripe)' }}>
                    <td style={{ padding: '.65rem 1rem', color: 'var(--text-main)', fontWeight: 600 }}>{m.tecnico_nombre || '—'}</td>
                    <td style={{ padding: '.65rem 1rem', color: 'var(--text-muted)' }}>{m.descripcion || '—'}</td>
                    <td style={{ padding: '.65rem 1rem' }}>
                      <span style={{
                        fontSize: '.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '20px',
                        background: m.estado_mantenimiento === 'Completado' ? '#f0fdf4' : m.estado_mantenimiento === 'Cancelado' ? '#fef2f2' : '#fff7ed',
                        color: m.estado_mantenimiento === 'Completado' ? '#15803d' : m.estado_mantenimiento === 'Cancelado' ? '#dc2626' : '#c2410c'
                      }}>{m.estado_mantenimiento}</span>
                    </td>
                    <td style={{ padding: '.65rem 1rem', color: 'var(--text-muted)', fontSize: '.8rem' }}>
                      {m.fecha ? new Date(m.fecha).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="history-section">
        <h2 className="history-title">Observaciones / Trabajos Realizados</h2>
        <div className="add-observation">
          <textarea 
            placeholder="Añadir nueva observación, diagnóstico o trabajo realizado..." 
            value={nuevaObservacion}
            onChange={(e) => setNuevaObservacion(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-submit" onClick={handleAgregar} disabled={guardando || !nuevaObservacion.trim()}>
              {guardando ? 'Guardando...' : '+ Registrar Observación'}
            </button>
          </div>
        </div>

        <div className="timeline">
          {historial.length === 0 ? (
            <div className="empty-state">
              No hay observaciones registradas para este equipo aún.
            </div>
          ) : (
            historial.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-user">{item.usuario_responsable || 'Sistema'}</span>
                    <span className="timeline-date">
                      {new Date(item.fecha).toLocaleString('es-CO', { 
                        year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="timeline-body">
                    {item.observacion}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HistorialDispositivo;
