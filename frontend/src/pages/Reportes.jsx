import { useState } from "react";
import "./CSS/Reportes.css";
import axios from "axios";
import usuariosIcon from "../assets/icons/reportes_usuario.svg";
import dispositivosIcon from "../assets/icons/reportes_dispositivos.svg";

function Reportes() {
  const [fechaUsuarios, setFechaUsuarios] = useState({ desde: "", hasta: "" });
  const [fechaDispositivos, setFechaDispositivos] = useState({ desde: "", hasta: "" });

  const descargar = (blob, headers, nombreBase, formato) => {
    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora  = ahora.toTimeString().slice(0, 5).replace(":", "-");

    let nombreArchivo = `${nombreBase}_${fecha}_${hora}.${formato}`;
    const disposition = headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        nombreArchivo = match[1].replace(/['"]/g, "").trim();
      }
    }

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generarUsuariosExcel = async () => {
    if (!fechaUsuarios.desde || !fechaUsuarios.hasta) {
      alert("Por favor selecciona las fechas Desde y Hasta para continuar.");
      return;
    }
    try {
      const params = { desde: fechaUsuarios.desde, hasta: fechaUsuarios.hasta };
      const res = await axios.get("http://localhost:5000/api/reportes/usuarios-excel", { responseType: "blob", params });
      descargar(res.data, res.headers, "reporte_usuarios", "xlsx");
    } catch (error) {
      console.error(error);
      alert("Error al descargar Excel de usuarios");
    }
  };

  const generarUsuariosPdf = async () => {
    if (!fechaUsuarios.desde || !fechaUsuarios.hasta) {
      alert("Por favor selecciona las fechas Desde y Hasta para continuar.");
      return;
    }
    try {
      const params = { desde: fechaUsuarios.desde, hasta: fechaUsuarios.hasta };
      const res = await axios.get("http://localhost:5000/api/reportes/usuarios-pdf", { responseType: "blob", params });
      descargar(res.data, res.headers, "reporte_usuarios", "pdf");
    } catch (error) {
      console.error(error);
      alert("Error al descargar PDF de usuarios");
    }
  };

  const generarDispositivosExcel = async () => {
    if (!fechaDispositivos.desde || !fechaDispositivos.hasta) {
      alert("Por favor selecciona las fechas Desde y Hasta para continuar.");
      return;
    }
    try {
      const params = { desde: fechaDispositivos.desde, hasta: fechaDispositivos.hasta };
      const res = await axios.get("http://localhost:5000/api/reportes/dispositivos-excel", { responseType: "blob", params });
      descargar(res.data, res.headers, "reporte_dispositivos", "xlsx");
    } catch (error) {
      console.error(error);
      alert("Error al descargar Excel de dispositivos");
    }
  };

  const generarDispositivosPdf = async () => {
    if (!fechaDispositivos.desde || !fechaDispositivos.hasta) {
      alert("Por favor selecciona las fechas Desde y Hasta para continuar.");
      return;
    }
    try {
      const params = { desde: fechaDispositivos.desde, hasta: fechaDispositivos.hasta };
      const res = await axios.get("http://localhost:5000/api/reportes/dispositivos-pdf", { responseType: "blob", params });
      descargar(res.data, res.headers, "reporte_dispositivos", "pdf");
    } catch (error) {
      console.error(error);
      alert("Error al descargar PDF de dispositivos");
    }
  };

  return (
    <div className="reportes-container">
      <h1 className="page-title">Generar Reportes</h1>
      <p className="subtitle">Genera los reportes que vayan según tu necesidad</p>

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
            <button
              onClick={generarUsuariosExcel}
              disabled={!fechaUsuarios.desde || !fechaUsuarios.hasta}
            >
              Generar Excel
            </button>
            <button
              onClick={generarUsuariosPdf}
              disabled={!fechaUsuarios.desde || !fechaUsuarios.hasta}
            >
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
            <button
              onClick={generarDispositivosExcel}
              disabled={!fechaDispositivos.desde || !fechaDispositivos.hasta}
            >
              Generar Excel
            </button>
            <button
              onClick={generarDispositivosPdf}
              disabled={!fechaDispositivos.desde || !fechaDispositivos.hasta}
            >
              Generar PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reportes;