import "./CSS/Reportes.css";
import axios from "axios";
import usuariosIcon from "../assets/icons/reportes_usuario.svg";
import dispositivosIcon from "../assets/icons/reportes_dispositivos.svg"
import bdIcon from "../assets/icons/reportes_bd.svg"

function Reportes() {

const generarUsuarios = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/reportes/usuarios-excel",
      { responseType: "blob" }
    );

    const disposition = res.headers["content-disposition"];
    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    let nombreArchivo = `reporte_usuarios_${fecha}.xlsx`;

    if (disposition && disposition.includes("filename=")) {
      nombreArchivo = disposition.split("filename=")[1];
    }

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();

  } catch (error) {
    console.error(error);
  }
};

const generarDispositivos = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/reportes/dispositivos-excel",
      { responseType: "blob" }
    );
const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const disposition = res.headers["content-disposition"];
    let nombreArchivo = `reporte_dispositivos_${fecha}.xlsx`;

    if (disposition && disposition.includes("filename=")) {
      nombreArchivo = disposition
        .split("filename=")[1]
        .replace(/"/g, "");
    }

    console.log("Nombre recibido:", nombreArchivo); // 👈 DEBUG

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();

  } catch (error) {
    console.error("Error al descargar dispositivos:", error);
  }
};

  return (
    <div className="reportes-container">

      <h1>Generar Reportes</h1> <br />
      <p className="subtitle">Genera los reportes que vayan según tu necesidad</p>

      <div className="cards">

        {/* Usuarios */}
        <div className="card">
          <img src={usuariosIcon} alt="usuarios" />
          <h3>Reporte Usuarios</h3>
          <button onClick={generarUsuarios}>Generar Reporte</button>
        </div>

        {/* Dispositivos */}
        <div className="card">
          <img src={dispositivosIcon} alt="dispositivos" />
          <h3>Reporte Dispositivos</h3>
          <button onClick={generarDispositivos}>Generar Reporte</button>
        </div>

      </div>

    </div>
  );
}

export default Reportes;