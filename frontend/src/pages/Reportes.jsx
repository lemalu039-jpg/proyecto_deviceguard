import { useState, useEffect, useCallback } from "react";
import "./CSS/Reportes.css";
import axios from "axios";
import usuariosIcon from "../assets/icons/reportes_usuario.svg";
import dispositivosIcon from "../assets/icons/reportes_dispositivos.svg";
import Pagination from "../components/Pagination";

const API = "http://localhost:5000/api/reportes";
const ITEMS_PER_PAGE = 10;

function Reportes() {
  const [fechaUsuarios, setFechaUsuarios] = useState({ desde: "", hasta: "" });
  const [fechaDispositivos, setFechaDispositivos] = useState({ desde: "", hasta: "" });

  // ── Preview state ──
  const [tipoPreview, setTipoPreview] = useState("usuarios");
  const [busqueda, setBusqueda] = useState("");
  const [previewDatos, setPreviewDatos] = useState([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  // ── Contador de reportes generados ──
  const [totalReportes, setTotalReportes] = useState(0);

  // Cargar contador al montar
  useEffect(() => {
    axios.get(`${API}/contador`)
      .then(res => setTotalReportes(res.data.total))
      .catch(() => {});
  }, []);

  // Recargar contador tras generar
  const recargarContador = () => {
    axios.get(`${API}/contador`)
      .then(res => setTotalReportes(res.data.total))
      .catch(() => {});
  };

  // ── Cargar preview con debounce ──
  const cargarPreview = useCallback(() => {
    setLoadingPreview(true);
    const endpoint = tipoPreview === "usuarios"
      ? `${API}/preview/usuarios`
      : `${API}/preview/dispositivos`;

    axios.get(endpoint, { params: { busqueda: busqueda || undefined } })
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
      alert("Por favor selecciona las fechas Desde y Hasta para continuar.");
      return;
    }
    try {
      const res = await axios.get(`${API}/usuarios-excel`, {
        responseType: "blob",
        params: { desde: fechaUsuarios.desde, hasta: fechaUsuarios.hasta },
      });
      descargar(res.data, res.headers, "reporte_usuarios", "xlsx");
      recargarContador();
    } catch { alert("Error al descargar Excel de usuarios"); }
  };

  const generarUsuariosPdf = async () => {
    if (!fechaUsuarios.desde || !fechaUsuarios.hasta) {
      alert("Por favor selecciona las fechas Desde y Hasta para continuar.");
      return;
    }
    try {
      const res = await axios.get(`${API}/usuarios-pdf`, {
        responseType: "blob",
        params: { desde: fechaUsuarios.desde, hasta: fechaUsuarios.hasta },
      });
      descargar(res.data, res.headers, "reporte_usuarios", "pdf");
      recargarContador();
    } catch { alert("Error al descargar PDF de usuarios"); }
  };

  const generarDispositivosExcel = async () => {
    if (!fechaDispositivos.desde || !fechaDispositivos.hasta) {
      alert("Por favor selecciona las fechas Desde y Hasta para continuar.");
      return;
    }
    try {
      const res = await axios.get(`${API}/dispositivos-excel`, {
        responseType: "blob",
        params: { desde: fechaDispositivos.desde, hasta: fechaDispositivos.hasta },
      });
      descargar(res.data, res.headers, "reporte_dispositivos", "xlsx");
      recargarContador();
    } catch { alert("Error al descargar Excel de dispositivos"); }
  };

  const generarDispositivosPdf = async () => {
    if (!fechaDispositivos.desde || !fechaDispositivos.hasta) {
      alert("Por favor selecciona las fechas Desde y Hasta para continuar.");
      return;
    }
    try {
      const res = await axios.get(`${API}/dispositivos-pdf`, {
        responseType: "blob",
        params: { desde: fechaDispositivos.desde, hasta: fechaDispositivos.hasta },
      });
      descargar(res.data, res.headers, "reporte_dispositivos", "pdf");
      recargarContador();
    } catch { alert("Error al descargar PDF de dispositivos"); }
  };

  // ── Columnas de la tabla según tipo ──
  const columnasUsuarios = ["ID", "Nombre", "Correo", "Rol", "Fecha de creación"];
  const columnasDispositivos = ["ID", "Nombre", "Serial", "Estado", "Usuario", "Fecha de registro"];

  const rolBadge = (rol) => {
    const map = {
      super_admin: { label: "Super Admin", cls: "rpt-badge-superadmin" },
      tecnico:     { label: "Técnico",     cls: "rpt-badge-tecnico"    },
      usuario:     { label: "Usuario",     cls: "rpt-badge-usuario"    },
    };
    const { label, cls } = map[rol] || { label: rol, cls: "" };
    return <span className={`rpt-badge ${cls}`}>{label}</span>;
  };

  const estadoBadge = (estado) => {
    const map = {
      "En Revision":        { label: "En Revisión",       cls: "rpt-badge-revision"     },
      "En Mantenimiento":   { label: "En Mantenimiento",  cls: "rpt-badge-mantenimiento" },
      "Listo para Entrega": { label: "Listo para Entrega",cls: "rpt-badge-listo"         },
      "Entregado":          { label: "Entregado",         cls: "rpt-badge-entregado"     },
    };
    const { label, cls } = map[estado] || { label: estado || "—", cls: "" };
    return <span className={`rpt-badge ${cls}`}>{label}</span>;
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
        <td>{row.nombre}</td>
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
      <h1 className="page-title">Generar Reportes</h1>
      <p className="subtitle">Genera los reportes que vayan según tu necesidad</p>

      {/* ── STAT CARDS ── */}
      <div className="reportes-stats">
        <div className="stat-card">
          <span className="stat-label">Registros en vista previa</span>
          <span className="stat-value">{previewTotal}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Reportes generados</span>
          <span className="stat-value">{totalReportes}</span>
        </div>
      </div>

      {/* ── VISTA PREVIA ── */}
      <div className="reportes-preview">
        <div className="preview-header">
          <h2>Vista previa</h2>
          <select
            className="preview-select"
            value={tipoPreview}
            onChange={e => { setTipoPreview(e.target.value); setBusqueda(""); }}
          >
            <option value="usuarios">Usuarios</option>
            <option value="dispositivos">Dispositivos</option>
          </select>
          <input
            className="preview-search"
            type="text"
            placeholder={
              tipoPreview === "usuarios"
                ? "Buscar por nombre, correo o rol..."
                : "Buscar por nombre, serial, estado o usuario..."
            }
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="preview-table-wrapper">
          {loadingPreview ? (
            <p className="preview-loading">Cargando datos...</p>
          ) : previewDatos.length === 0 ? (
            <p className="preview-empty">No se encontraron registros.</p>
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

      {/* ── EXPORT CARDS (funcionalidad original) ── */}
      <p className="section-title">Exportar reportes</p>
      <div className="cards">

        {/* Usuarios */}
        <div className="reporte-card">
          <img src={usuariosIcon} alt="usuarios" />
          <h3>Reporte Usuarios</h3>
          <div className="reporte-fechas">
            <label>Desde
              <input type="date" value={fechaUsuarios.desde}
                onChange={e => setFechaUsuarios(f => ({ ...f, desde: e.target.value }))} />
            </label>
            <label>Hasta
              <input type="date" value={fechaUsuarios.hasta}
                onChange={e => setFechaUsuarios(f => ({ ...f, hasta: e.target.value }))} />
            </label>
          </div>
          <div className="btn-group">
            <button onClick={generarUsuariosExcel} disabled={!fechaUsuarios.desde || !fechaUsuarios.hasta}>
              Generar Excel
            </button>
            <button onClick={generarUsuariosPdf} disabled={!fechaUsuarios.desde || !fechaUsuarios.hasta}>
              Generar PDF
            </button>
          </div>
        </div>

        {/* Dispositivos */}
        <div className="reporte-card">
          <img src={dispositivosIcon} alt="dispositivos" />
          <h3>Reporte Dispositivos</h3>
          <div className="reporte-fechas">
            <label>Desde
              <input type="date" value={fechaDispositivos.desde}
                onChange={e => setFechaDispositivos(f => ({ ...f, desde: e.target.value }))} />
            </label>
            <label>Hasta
              <input type="date" value={fechaDispositivos.hasta}
                onChange={e => setFechaDispositivos(f => ({ ...f, hasta: e.target.value }))} />
            </label>
          </div>
          <div className="btn-group">
            <button onClick={generarDispositivosExcel} disabled={!fechaDispositivos.desde || !fechaDispositivos.hasta}>
              Generar Excel
            </button>
            <button onClick={generarDispositivosPdf} disabled={!fechaDispositivos.desde || !fechaDispositivos.hasta}>
              Generar PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reportes;
