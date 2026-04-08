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

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "usuarios.xlsx";
    link.click();
  } catch (error) {
    console.error("Error al descargar usuarios:", error);
  }
};

const generarDispositivos = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/reportes/dispositivos-excel",
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "dispositivos.xlsx";
    link.click();
  } catch (error) {
    console.error("Error al descargar dispositivos:", error);
  }
};

const generarBD = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/reportes/bd-excel",
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "bd.xlsx";
    link.click();
  } catch (error) {
    console.error("Error al descargar BD:", error);
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
          <h3 id="olga">Reporte Dispositivos</h3>
          <button onClick={generarDispositivos}>Generar Reporte</button>
        </div>

      </div>

    </div>
  );
}

export default Reportes;