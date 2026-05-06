import React, { useEffect, useState } from "react";
import { getDispositivos, updateDispositivo } from "../services/api";
import axios from 'axios';
import "./css/GestionMantenimiento.css";
import Pagination from "../components/Pagination";
import TableSkeleton from "../components/TableSkeleton";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getUsuarios } from "../services/api";

function AsignacionTareas() {
  const { t } = useLanguage();
  const [tecnicos, setTecnicos] = useState([]);
  const [dispositivosPorAsignar, setDispositivosPorAsignar] = useState([]);
  const [todasAsignaciones, setTodasAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [tecnicosPage, setTecnicosPage] = useState(1);
  const tecnicosPorPagina = 8;
  
  // Filtros
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Estado local para selecciones de técnico por dispositivo
  const [selecciones, setSelecciones] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [usuRes, dispRes] = await Promise.all([
        getUsuarios(),
        getDispositivos()
      ]);
      const listaTecnicos = usuRes.data.filter(u => u.rol === 'tecnico');
      setTecnicos(listaTecnicos);
      const todosDisp = dispRes.data;
      setTodasAsignaciones(todosDisp);
      const pendientes = todosDisp.filter(d =>
        d.estado === "En Revision" && !d.tecnico_id
      );
      setDispositivosPorAsignar(pendientes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
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
      {tecnicos.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>{t('asignacion_sin_tecnicos')}</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {tecnicos
              .slice((tecnicosPage - 1) * tecnicosPorPagina, tecnicosPage * tecnicosPorPagina)
              .map(t_tec => {
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
              })}
          </div>
          <Pagination
            totalItems={tecnicos.length}
            itemsPerPage={tecnicosPorPagina}
            currentPage={tecnicosPage}
            onPageChange={setTecnicosPage}
          />
        </>
      )}

      {/* Panel de Asignaciones */}
      <div className="mant-card">
        <div className="mant-card-title">
          <div className="mant-dot" style={{ background: '#7e22ce' }}></div>
          <span style={{ whiteSpace: 'nowrap' }}>{t('asignacion_pendientes')}</span>
          <input
            type="text"
            placeholder={t('dash_buscar_ph')}
            value={filtroBusqueda}
            onChange={e => { setFiltroBusqueda(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1, minWidth: '160px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none' }}
          />
          {filtroBusqueda && (
            <button
              onClick={() => { setFiltroBusqueda(''); setCurrentPage(1); }}
              style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
            >
              {t('dash_limpiar')} ✕
            </button>
          )}
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
              {loadingData ? (
                <TableSkeleton rows={7} cols={5} />
              ) : dispositivosPorAsignar.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {t('asignacion_sin_dispositivos')}
                  </td>
                </tr>
              ) : (
                dispositivosPorAsignar
                  .filter(d => {
                    const texto = `${d.nombre} ${d.serial} ${d.registrado_por || ''}`.toLowerCase();
                    return !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
                  })
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map(d => (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.82rem' }}>{d.nombre}</div>
                        <div style={{ fontSize: '.71rem', color: 'var(--text-muted)', marginTop: '1px' }}>{d.tipo || ''}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{d.serial}</td>
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
            totalItems={dispositivosPorAsignar.filter(d => {
              const texto = `${d.nombre} ${d.serial} ${d.registrado_por || ''}`.toLowerCase();
              return !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
            }).length}
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
