import { useState } from "react";
import "./CSS/Reportes.css";
import axios from "axios";
import usuariosIcon from "../assets/icons/reportes_usuario.svg";
import dispositivosIcon from "../assets/icons/reportes_dispositivos.svg";

function Reportes() {
  const [fechaUsuarios, setFechaUsuarios] = useState({ desde: "", hasta: "" });
  const [fechaDispositivos, setFechaDispositivos] = useState({ desde: "", hasta: "" });

  const descargar = (blob, headers, nombreBase) => {
    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora  = ahora.toTimeString().slice(0, 5).replace(":", "-");

    // Intentar usar el nombre que manda el backend
    let nombreArchivo = `${nombreBase}_${fecha}_${hora}.xlsx`;
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

  const generarUsuarios = async () => {
    try {
      const params = {};
      if (fechaUsuarios.desde) params.desde = fechaUsuarios.desde;
      if (fechaUsuarios.hasta) params.hasta = fechaUsuarios.hasta;
      const res = await axios.get(
        "http://localhost:5000/api/reportes/usuarios-excel",
        { responseType: "blob", params }
      );
      descargar(res.data, res.headers, "reporte_usuarios");
    } catch (error) {
      console.error(error);
    }
  };

  const generarDispositivos = async () => {
    try {
      const params = {};
      if (fechaDispositivos.desde) params.desde = fechaDispositivos.desde;
      if (fechaDispositivos.hasta) params.hasta = fechaDispositivos.hasta;
      const res = await axios.get(
        "http://localhost:5000/api/reportes/dispositivos-excel",
        { responseType: "blob", params }
      );
      descargar(res.data, res.headers, "reporte_dispositivos");
    } catch (error) {
      console.error("Error al descargar dispositivos:", error);
    }
  };

  return (
    <div className="reportes-container">
      <h1>Generar Reportes</h1>
      <p className="subtitle">Genera los reportes que vayan según tu necesidad</p>

      <div className="cards">

        {/* Usuarios */}
        <div className="card">
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
          <button onClick={generarUsuarios}>Generar Reporte</button>
        </div>

        {/* Dispositivos */}
        <div className="card">
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
          <button onClick={generarDispositivos}>Generar Reporte</button>
        </div>

      </div>
    </div>
  );
}

export default Reportes;