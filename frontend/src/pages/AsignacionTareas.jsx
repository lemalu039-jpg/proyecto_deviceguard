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
  const [vistaFiltro, setVistaFiltro] = useState('sin_asignar');

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
    <div className="mant-dot" style={{ background: '#0492C2' }}></div>

    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
      <button
        onClick={() => { setVistaFiltro('sin_asignar'); setCurrentPage(1); }}
        style={{
          padding: '5px 14px', borderRadius: '20px', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          background: vistaFiltro === 'sin_asignar' ? 'linear-gradient(135deg,#0492C2,#82EEFD)' : 'var(--input-bg)',
          color: vistaFiltro === 'sin_asignar' ? '#fff' : 'var(--text-muted)'
        }}>
        Sin asignar ({dispositivosPorAsignar.length})
      </button>
      <button
        onClick={() => { setVistaFiltro('asignados'); setCurrentPage(1); }}
        style={{
          padding: '5px 14px', borderRadius: '20px', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          background: vistaFiltro === 'asignados' ? 'linear-gradient(135deg,#0492C2,#82EEFD)' : 'var(--input-bg)',
          color: vistaFiltro === 'asignados' ? '#fff' : 'var(--text-muted)'
        }}>
        Asignados ({todasAsignaciones.filter(d => d.tecnico_id && (d.estado === "En Revision" || d.estado === "En Mantenimiento")).length})
      </button>
    </div>

    <input
      type="text"
      placeholder={t('dash_buscar_ph')}
      value={filtroBusqueda}
      onChange={e => { setFiltroBusqueda(e.target.value); setCurrentPage(1); }}
      style={{ flex: 1, minWidth: '160px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none' }}
    />
    {filtroBusqueda && (
      <button onClick={() => { setFiltroBusqueda(''); setCurrentPage(1); }}
        style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
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
          <th>{vistaFiltro === 'sin_asignar' ? t('asignacion_seleccionar_tecnico') : 'Técnico asignado'}</th>
          {vistaFiltro === 'asignados' && <th>{t('dash_col_estado')}</th>}
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {loadingData ? (
          <TableSkeleton rows={7} cols={vistaFiltro === 'asignados' ? 6 : 5} noWrapper />
        ) : vistaFiltro === 'sin_asignar' ? (
          dispositivosPorAsignar.filter(d => {
            const texto = `${d.nombre} ${d.serial} ${d.registrado_por || ''}`.toLowerCase();
            return !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
          }).length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t('asignacion_sin_dispositivos')}</td></tr>
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
                  <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{d.registrado_por || '—'}</td>
                  <td>
                    <select className="mant-select" style={{ width: '100%', maxWidth: '200px' }}
                      value={selecciones[d.id] || ""}
                      onChange={(e) => handleSelectChange(d.id, e.target.value)}>
                      <option value="">{t('asignacion_seleccionar_tecnico')}</option>
                      {tecnicos.map(tec => (
                        <option key={tec.id} value={tec.id}>{tec.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => asignarTecnico(d.id)} disabled={!selecciones[d.id] || loading}
                      style={{
                        background: selecciones[d.id] ? 'linear-gradient(135deg,#0492C2,#82EEFD)' : 'var(--input-bg)',
                        color: selecciones[d.id] ? '#fff' : 'var(--text-muted)',
                        border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem', fontWeight: 600, cursor: selecciones[d.id] && !loading ? 'pointer' : 'not-allowed'
                      }}>
                      {t('asignacion_btn_asignar')}
                    </button>
                  </td>
                </tr>
              ))
          )
        ) : (
          todasAsignaciones
            .filter(d => d.tecnico_id && (d.estado === "En Revision" || d.estado === "En Mantenimiento"))
            .filter(d => {
              const tecnico = tecnicos.find(t => String(t.id) === String(d.tecnico_id));
              const texto = `${d.nombre} ${d.serial} ${tecnico?.nombre || ''}`.toLowerCase();
              return !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
            }).length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Sin dispositivos asignados</td></tr>
          ) : (
            todasAsignaciones
              .filter(d => d.tecnico_id && (d.estado === "En Revision" || d.estado === "En Mantenimiento"))
              .filter(d => {
                const tecnico = tecnicos.find(t => String(t.id) === String(d.tecnico_id));
                const texto = `${d.nombre} ${d.serial} ${tecnico?.nombre || ''}`.toLowerCase();
                return !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
              })
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map(d => {
                const tecnico = tecnicos.find(t => String(t.id) === String(d.tecnico_id));
                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.82rem' }}>{d.nombre}</div>
                      <div style={{ fontSize: '.71rem', color: 'var(--text-muted)', marginTop: '1px' }}>{d.tipo || ''}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{d.serial}</td>
                    <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{d.registrado_por || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#0492C2,#82EEFD)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.75rem', flexShrink: 0 }}>
                          {tecnico?.nombre?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span style={{ fontSize: '.82rem', color: 'var(--text-main)', fontWeight: 600 }}>{tecnico?.nombre || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '.72rem', fontWeight: 700,
  background: d.estado === "En Mantenimiento" ? "rgba(192,132,252,0.15)" :
              d.estado === "En Revision" ? "rgba(245,158,11,0.15)" :
              d.estado === "Listo para Entrega" ? "rgba(34,197,94,0.15)" :
              d.estado === "Entregado" ? "rgba(56,189,248,0.15)" : "var(--input-bg)",
  color: d.estado === "En Mantenimiento" ? "#c084fc" :
         d.estado === "En Revision" ? "#f59e0b" :
         d.estado === "Listo para Entrega" ? "#22c55e" :
         d.estado === "Entregado" ? "#38bdf8" : "var(--text-muted)" }}>
  {d.estado}
</span>
                    </td>
                    <td>
                      <button onClick={async () => { try { await updateDispositivo(d.id, { tecnico_id: null }); loadData(); } catch(e) { console.error(e); } }}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                        Desasignar
                      </button>
                    </td>
                  </tr>
                );
              })
          )
        )}
      </tbody>
    </table>
  </div>

  <Pagination
    totalItems={vistaFiltro === 'sin_asignar'
      ? dispositivosPorAsignar.filter(d => {
          const texto = `${d.nombre} ${d.serial} ${d.registrado_por || ''}`.toLowerCase();
          return !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
        }).length
      : todasAsignaciones.filter(d => {
          const tecnico = tecnicos.find(t => String(t.id) === String(d.tecnico_id));
          const texto = `${d.nombre} ${d.serial} ${tecnico?.nombre || ''}`.toLowerCase();
          return d.tecnico_id && (d.estado === "En Revision" || d.estado === "En Mantenimiento") && (!filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase()));
        }).length
    }
    itemsPerPage={itemsPerPage}
    currentPage={currentPage}
    onPageChange={setCurrentPage}
  />
</div>
    </div>
  );
}

export default AsignacionTareas;
