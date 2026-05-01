import React, { useEffect, useState } from "react";
import { getDispositivos, updateDispositivo } from "../services/api";
import axios from 'axios';
import "./css/GestionMantenimiento.css"; // Reutilizamos estilos
import Pagination from "../components/Pagination";
import { useLanguage } from "../context/LanguageContext.jsx";

// Importo axios para hacer getUsuarios temporal si no está en api.js, o lo hago manual
// Espera, voy a importar getUsuarios desde api.js
import { getUsuarios } from "../services/api";

function AsignacionTareas() {
  const { t } = useLanguage();
  const [tecnicos, setTecnicos] = useState([]);
  const [dispositivosPorAsignar, setDispositivosPorAsignar] = useState([]);
  const [todasAsignaciones, setTodasAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Estado local para selecciones de técnico por dispositivo
  const [selecciones, setSelecciones] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usuRes, dispRes] = await Promise.all([
        getUsuarios(),
        getDispositivos()
      ]);

      const listaTecnicos = usuRes.data.filter(u => u.rol === 'tecnico');
      setTecnicos(listaTecnicos);

      const todosDisp = dispRes.data;
      setTodasAsignaciones(todosDisp);

      // Dispositivos sin técnico asignado (En Revisión)
      const pendientes = todosDisp.filter(d => 
        d.estado === "En Revision" && !d.tecnico_id
      );
      setDispositivosPorAsignar(pendientes);

    } catch (error) {
      console.error(error);
    }
  };

  const getTareasActivas = (tecnicoId) => {
    return todasAsignaciones.filter(d => 
      String(d.tecnico_id) === String(tecnicoId) && 
      (d.estado === 'En Revision' || d.estado === 'En Mantenimiento')
    ).length;
  };

  const handleSelectChange = (dispId, tecnicoId) => {
    setSelecciones(prev => ({ ...prev, [dispId]: tecnicoId }));
  };

  const asignarTecnico = async (dispId) => {
    const tecnicoId = selecciones[dispId];
    if (!tecnicoId) return;

    setLoading(true);
    try {
      await updateDispositivo(dispId, { tecnico_id: parseInt(tecnicoId) });
      // Limpiar selección de ese dispositivo
      setSelecciones(prev => {
        const copy = { ...prev };
        delete copy[dispId];
        return copy;
      });
      loadData();
    } catch (error) {
      console.error(error);
      alert(t('asignacion_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mant-wrapper">
      <div className="mant-wrapper-tittle">
        <h1 className="page-title">{t('asignacion_title')}</h1>
      </div>

      {/* Panel de Técnicos (Overview) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {tecnicos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>{t('asignacion_sin_tecnicos')}</p>
        ) : (
          tecnicos.map(t_tec => {
            const activas = getTareasActivas(t_tec.id);
            return (
              <div key={t_tec.id} style={{
                background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)',
                padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0492C2, #82EEFD)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
                }}>
                  {t_tec.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.9rem' }}>{t_tec.nombre}</div>
                  <div style={{ fontSize: '.75rem', color: activas === 0 ? '#10b981' : (activas > 3 ? '#ef4444' : 'var(--text-muted)'), fontWeight: 600 }}>
                    {activas} {t('asignacion_tareas_activas')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Panel de Asignaciones */}
      <div className="mant-card">
        <div className="mant-card-title">
          <div className="mant-dot" style={{ background: '#7e22ce' }}></div>
          <span>{t('asignacion_pendientes')}</span>
        </div>

        <div className="mant-table-wrap">
          <table className="mant-table">
            <thead>
              <tr>
                <th>{t('dash_col_nombre')}</th>
                <th>{t('dash_col_serial')}</th>
                <th>{t('dash_col_reg_por')}</th>
                <th>{t('asignacion_seleccionar_tecnico')}</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {dispositivosPorAsignar.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {t('asignacion_sin_dispositivos')}
                  </td>
                </tr>
              ) : (
                dispositivosPorAsignar
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map(d => (
                    <tr key={d.id}>
                      <td>{d.nombre}</td>
                      <td style={{ fontFamily: 'monospace' }}>{d.serial}</td>
                      <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {d.registrado_por || '—'}
                      </td>
                      <td>
                        <select
                          className="mant-select"
                          style={{ width: '100%', maxWidth: '200px' }}
                          value={selecciones[d.id] || ""}
                          onChange={(e) => handleSelectChange(d.id, e.target.value)}
                        >
                          <option value="">{t('asignacion_seleccionar_tecnico')}</option>
                          {tecnicos.map(tec => (
                            <option key={tec.id} value={tec.id}>{tec.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button 
                          onClick={() => asignarTecnico(d.id)}
                          disabled={!selecciones[d.id] || loading}
                          style={{
                            background: selecciones[d.id] ? 'linear-gradient(135deg, #7e22ce, #a855f7)' : 'var(--input-bg)',
                            color: selecciones[d.id] ? '#fff' : 'var(--text-muted)',
                            border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem',
                            fontSize: '0.75rem', fontWeight: 600, cursor: selecciones[d.id] && !loading ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t('asignacion_btn_asignar')}
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {dispositivosPorAsignar.length > 0 && (
          <Pagination
            totalItems={dispositivosPorAsignar.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

export default AsignacionTareas;
