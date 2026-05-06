import { useState, useEffect, useCallback } from "react";
import "./css/Reportes.css";
import axios from "axios";
import api from "../services/api";
import usuariosIcon from "../assets/icons/reportes_usuario.svg";
import dispositivosIcon from "../assets/icons/reportes_dispositivos.svg";
import Pagination from "../components/Pagination";
import TableSkeleton from "../components/TableSkeleton";
import { useLanguage } from "../context/LanguageContext.jsx";

const API = "http://localhost:5000/api/reportes";
const ITEMS_PER_PAGE = 7;

function Reportes() {
  const { t } = useLanguage();
  const [fechaUsuarios, setFechaUsuarios] = useState({ desde: "", hasta: "", rol: "todos" });
  const [fechaDispositivos, setFechaDispositivos] = useState({ desde: "", hasta: "", estado: "todos" });

  // ── Preview state ──
  const [tipoPreview, setTipoPreview] = useState(() => {
    const u = JSON.parse(localStorage.getItem("usuario") || '{}');
    return u.rol === 'tecnico' ? "dispositivos" : "usuarios";
  });
  const [busqueda, setBusqueda] = useState("");
  const [previewDatos, setPreviewDatos] = useState([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esTecnico = usuario?.rol === 'tecnico';

  // ── Modal export ──
  const [modalExport, setModalExport] = useState(false);

  // ── Contador de reportes generados ──
  const [totalReportes, setTotalReportes] = useState(0);

  // Cargar contador al montar
  useEffect(() => {
    api.get('/reportes/total')
      .then(res => setTotalReportes(res.data.total))
      .catch(() => {});
  }, []);

  const recargarContador = () => {
    api.get('/reportes/total')
      .then(res => setTotalReportes(res.data.total))
      .catch(() => {});
  };

  const resetFiltros = () => {
    setFechaUsuarios({ desde: "", hasta: "", rol: "todos" });
    setFechaDispositivos({ desde: "", hasta: "", estado: "todos" });
  };

  // ── Cargar preview con debounce ──
  const cargarPreview = useCallback(() => {
    setLoadingPreview(true);
    const endpoint = tipoPreview === "usuarios"
      ? `${API}/preview/usuarios`
      : `${API}/preview/dispositivos`;

    const params = { busqueda: busqueda || undefined };
    if (esTecnico && tipoPreview === "dispositivos") {
      params.tecnico_id = usuario?.id;
    }

    axios.get(endpoint, { params, headers: { 'x-usuario-id': usuario?.id } })
      .then(res => {
        setPreviewDatos(res.data.datos);
        setPreviewTotal(res.data.total);
      })
      .catch(() => {
        setPreviewDatos([]);
        setPreviewTotal(0);
      })
      .finally(() => setLoadingPreview(false));
  }, [tipoPreview, busqueda]);

  useEffect(() => {
    const timer = setTimeout(cargarPreview, 350);
    return () => clearTimeout(timer);
  }, [cargarPreview]);

  // Resetear página al cambiar filtros
  useEffect(() => { setPaginaActual(1); }, [tipoPreview, busqueda]);

  // Slice de datos para la página actual
  const datosPagina = previewDatos.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // ── Descarga helper ──
  const descargar = (blob, headers, nombreBase, formato) => {
    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora  = ahora.toTimeString().slice(0, 5).replace(":", "-");
    let nombreArchivo = `${nombreBase}_${fecha}_${hora}.${formato}`;
    const disposition = headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) nombreArchivo = match[1].replace(/['"]/g, "").trim();
    }
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // ── Generadores ──
  const generarUsuariosExcel = async () => {
    if (!fechaUsuarios.desde || !fechaUsuarios.hasta) {
      alert(t('reportes_err_fechas'));
      return;
    }
    try {
      const res = await axios.get(`${API}/usuarios-excel`, {
        responseType: "blob",
        params: { desde: fechaUsuarios.desde, hasta: fechaUsuarios.hasta, rol: fechaUsuarios.rol, _t: Date.now() },
  headers: {
    'x-usuario-id': usuario?.id
  }
      });
      descargar(res.data, res.headers, "reporte_usuarios", "xlsx");
      recargarContador();
      setModalExport(null);
      resetFiltros();
    } catch { alert(t('reportes_err_excel_usuarios')); }
  };

  const generarUsuariosPdf = async () => {
    if (!fechaUsuarios.desde || !fechaUsuarios.hasta) {
      alert(t('reportes_err_fechas'));
      return;
    }
    try {
      const res = await axios.get(`${API}/usuarios-pdf`, {
        responseType: "blob",
        params: { desde: fechaUsuarios.desde, hasta: fechaUsuarios.hasta, rol: fechaUsuarios.rol, _t: Date.now() },
        headers: {
  'x-usuario-id': usuario?.id
}
      });
      descargar(res.data, res.headers, "reporte_usuarios", "pdf");
      recargarContador();
      setModalExport(null);
      resetFiltros();
    } catch { alert(t('reportes_err_pdf_usuarios')); }
  };

  const generarDispositivosExcel = async () => {
    if (!fechaDispositivos.desde || !fechaDispositivos.hasta) {
      alert(t('reportes_err_fechas'));
      return;
    }
    try {
      const res = await axios.get(`${API}/dispositivos-excel`, {
        responseType: "blob",
        params: { desde: fechaDispositivos.desde, hasta: fechaDispositivos.hasta, estado: fechaDispositivos.estado, _t: Date.now() },
        headers: {
  'x-usuario-id': usuario?.id
}
      });
      descargar(res.data, res.headers, "reporte_dispositivos", "xlsx");
      recargarContador();
      setModalExport(null);
      resetFiltros();
    } catch { alert(t('reportes_err_excel_disp')); }
  };

  const generarDispositivosPdf = async () => {
    if (!fechaDispositivos.desde || !fechaDispositivos.hasta) {
      alert(t('reportes_err_fechas'));
      return;
    }
    try {
      const res = await axios.get(`${API}/dispositivos-pdf`, {
        responseType: "blob",
        params: { desde: fechaDispositivos.desde, hasta: fechaDispositivos.hasta, estado: fechaDispositivos.estado, _t: Date.now() },
        headers: {
  'x-usuario-id': usuario?.id
}
      });
      descargar(res.data, res.headers, "reporte_dispositivos", "pdf");
      recargarContador();
      setModalExport(null);
      resetFiltros();
    } catch { alert(t('reportes_err_pdf_disp')); }
  };

  // ── Columnas de la tabla según tipo ──
  const columnasUsuarios = [t('id'), t('dash_col_nombre'), t('correo_col_correo'), t('rol'), t('reportes_fecha_creacion')];
  const columnasDispositivos = [t('id'), t('dash_col_nombre'), t('dash_col_serial'), t('dash_col_estado'), t('equipo_col_usuario'), t('dash_col_fecha_reg')];

  const rolBadge = (rol) => {
    const map = {
      super_admin: { labelKey: 'rpt_rol_superadmin', cls: "rpt-badge-superadmin" },
      admin:       { labelKey: 'admin',              cls: "rpt-badge-admin"      },
      tecnico:     { labelKey: 'rpt_rol_tecnico',    cls: "rpt-badge-tecnico"    },
      usuario:     { labelKey: 'rpt_rol_usuario',    cls: "rpt-badge-usuario"    },
    };
    const { labelKey, cls } = map[rol] || { labelKey: null, cls: "" };
    return <span className={`rpt-badge ${cls}`}>{labelKey ? t(labelKey) : rol}</span>;
  };

  const estadoBadge = (estado) => {
    const map = {
      "En Revision":        { labelKey: 'dash_en_revision',      cls: "rpt-badge-revision"     },
      "En Mantenimiento":   { labelKey: 'dash_en_mantenimiento',  cls: "rpt-badge-mantenimiento" },
      "Listo para Entrega": { labelKey: 'dash_listo_entrega',     cls: "rpt-badge-listo"         },
      "Entregado":          { labelKey: 'dash_entregado',         cls: "rpt-badge-entregado"     },
    };
    const { labelKey, cls } = map[estado] || { labelKey: null, cls: "" };
    return <span className={`rpt-badge ${cls}`}>{labelKey ? t(labelKey) : (estado || "—")}</span>;
  };

  const renderFila = (row, i) => {
    if (tipoPreview === "usuarios") {
      return (
        <tr key={i}>
          <td>{row.id}</td>
          <td>{row.nombre}</td>
          <td>{row.correo}</td>
          <td>{rolBadge(row.rol)}</td>
          <td>
            {row.fecha_creacion ? (
              <>
                <span>{new Date(row.fecha_creacion).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span>
                <br />
                <span className="rpt-hora">{new Date(row.fecha_creacion).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
              </>
            ) : "—"}
          </td>
        </tr>
      );
    }
    return (
      <tr key={i}>
        <td>{row.id}</td>
        <td>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.82rem' }}>{row.nombre}</div>
          <div style={{ fontSize: '.71rem', color: 'var(--text-muted)', marginTop: '1px' }}>{row.tipo || ''}</div>
        </td>
        <td>{row.serial}</td>
        <td>{estadoBadge(row.estado)}</td>
        <td>{row.usuario || "—"}</td>
        <td>
          {row.fecha_registro ? (
            <>
              <span>{new Date(row.fecha_registro).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span>
              <br />
              <span className="rpt-hora">{row.hora_registro || new Date(row.fecha_registro).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
            </>
          ) : "—"}
        </td>
      </tr>
    );
  };

  const columnas = tipoPreview === "usuarios" ? columnasUsuarios : columnasDispositivos;

  return (
    <div className="reportes-container">
      <div className="page-title-row">
        <h1 className="page-title">{t('reportes_title')}</h1>
        <button className="card-open-btn" onClick={() => setModalExport(true)}>
          {t('reportes_exportar')}
        </button>
      </div>
      <p className="subtitle">{t('reportes_subtitle')}</p>

      {/* ── STAT CARDS ── */}
      <div className="reportes-stats">
        <div className="stat-card">
          <span className="stat-label">{t('reportes_reg_vista')}</span>
          <span className="stat-value">{previewTotal}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{t('reportes_generados')}</span>
          <span className="stat-value">{totalReportes}</span>
        </div>
      </div>

      {/* ── VISTA PREVIA ── */}
      <div className="reportes-preview">
        <div className="preview-header">
          <h2>{t('reportes_vista_previa')}</h2>
          <select
            className="preview-select"
            value={tipoPreview}
            onChange={e => { setTipoPreview(e.target.value); setBusqueda(""); }}
          >
            {!esTecnico && <option value="usuarios">{t('dash_usuarios')}</option>}
            <option value="dispositivos">{t('dash_dispositivos')}</option>
          </select>
          <input
            className="preview-search"
            type="text"
            placeholder={
              tipoPreview === "usuarios"
                ? t('reportes_buscar_usu')
                : t('reportes_buscar_disp')
            }
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="preview-table-wrapper">
          {loadingPreview ? (
            <table className="preview-table">
              <thead>
                <tr>
                  {columnas.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <TableSkeleton rows={7} cols={columnas.length} />
            </table>
          ) : previewDatos.length === 0 ? (
            <p className="preview-empty">{t('reportes_no_registros')}</p>
          ) : (
            <table className="preview-table">
              <thead>
                <tr>
                  {columnas.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {datosPagina.map((row, i) => renderFila(row, i))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          totalItems={previewDatos.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={paginaActual}
          onPageChange={setPaginaActual}
        />
      </div>


      {/* ── MODAL EXPORT ── */}
      {modalExport === true && (
        <div className="modal-overlay" onClick={() => { setModalExport(null); resetFiltros(); }}>
          <div className="modal-content modal-export" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('reportes_exportar')}</h2>
              <button className="modal-close" onClick={() => { setModalExport(null); resetFiltros(); }}>✕</button>
            </div>
            <div className="modal-export-body">
              <div className="cards">
                {/* Usuarios */}
                <div className="reporte-card">
                  <img src={usuariosIcon} alt="usuarios" />
                  <h3>{t('reportes_rep_usuarios')}</h3>
                  <div className="reporte-fechas">
                    <label>{t('rol')}
                      <select
                        value={fechaUsuarios.rol}
                        onChange={e => setFechaUsuarios(f => ({ ...f, rol: e.target.value }))}
                      >
                        <option value="todos">{t('reportes_todos')}</option>
                        <option value="usuario">{t('dash_usuarios')}</option>
                        <option value="tecnico">{t('reportes_tecnicos')}</option>
                      </select>
                    </label>
                    <label>{t('reportes_desde')}
                      <input type="date" value={fechaUsuarios.desde}
                        onChange={e => setFechaUsuarios(f => ({ ...f, desde: e.target.value }))} />
                    </label>
                    <label>{t('reportes_hasta')}
                      <input type="date" value={fechaUsuarios.hasta}
                        onChange={e => setFechaUsuarios(f => ({ ...f, hasta: e.target.value }))} />
                    </label>
                  </div>
                  <div className="btn-group">
                    <button onClick={generarUsuariosExcel} disabled={!fechaUsuarios.desde || !fechaUsuarios.hasta}>
                      {t('reportes_gen_excel')}
                    </button>
                    <button onClick={generarUsuariosPdf} disabled={!fechaUsuarios.desde || !fechaUsuarios.hasta}>
                      {t('reportes_gen_pdf')}
                    </button>
                  </div>
                </div>

                {/* Dispositivos */}
                <div className="reporte-card">
                  <img src={dispositivosIcon} alt="dispositivos" />
                  <h3>{t('reportes_rep_disp')}</h3>
                  <div className="reporte-fechas">
                    <label>{t('dash_col_estado')}
                      <select
                        value={fechaDispositivos.estado}
                        onChange={e => setFechaDispositivos(f => ({ ...f, estado: e.target.value }))}
                      >
                        <option value="todos">{t('reportes_todos')}</option>
                        <option value="En Revision">{t('dash_en_revision')}</option>
                        <option value="Listo para entrega">{t('dash_listo_entrega')}</option>
                        <option value="En Mantenimiento">{t('dash_en_mantenimiento')}</option>
                        <option value="Entregado">{t('dash_entregado')}</option>
                      </select>
                    </label>
                    <label>{t('reportes_desde')}
                      <input type="date" value={fechaDispositivos.desde}
                        onChange={e => setFechaDispositivos(f => ({ ...f, desde: e.target.value }))} />
                    </label>
                    <label>{t('reportes_hasta')}
                      <input type="date" value={fechaDispositivos.hasta}
                        onChange={e => setFechaDispositivos(f => ({ ...f, hasta: e.target.value }))} />
                    </label>
                  </div>
                  <div className="btn-group">
                    <button onClick={generarDispositivosExcel} disabled={!fechaDispositivos.desde || !fechaDispositivos.hasta}>
                      {t('reportes_gen_excel')}
                    </button>
                    <button onClick={generarDispositivosPdf} disabled={!fechaDispositivos.desde || !fechaDispositivos.hasta}>
                      {t('reportes_gen_pdf')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Reportes;
