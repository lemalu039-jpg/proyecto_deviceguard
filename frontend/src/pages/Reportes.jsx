import "./CSS/Reportes.css";
import axios from "axios";
import usuariosIcon from "../assets/icons/reportes_usuario.svg";
import dispositivosIcon from "../assets/icons/reportes_dispositivos.svg"
import bdIcon from "../assets/icons/reportes_bd.svg"

function Reportes() {

  const generarUsuarios = async () => {
    const res = await axios.get("http://localhost:5000/api/reportes/usuarios", {
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "usuarios.pdf");
    document.body.appendChild(link);
    link.click();
  };

  const generarDispositivos = async () => {
  const res = await axios.get("http://localhost:5000/api/reportes/dispositivos", {
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "dispositivos.pdf");
  document.body.appendChild(link);
  link.click();
};

  const generarBD = async () => {
  const res = await axios.get("http://localhost:5000/api/reportes/bd", {
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "bd.pdf");
  document.body.appendChild(link);
  link.click();
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

        {/* BD */}
        <div className="card">
          <img src={bdIcon} alt="bd" />
          <h3>Reporte BD</h3>
          <button onClick={generarBD}>Generar Reporte</button>
        </div>

      </div>

    </div>
  );
}

export default Reportes;