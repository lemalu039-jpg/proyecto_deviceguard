import { useEffect, useState } from "react";
import "./CSS/ConsultarFiltros.css";
import { getDispositivos } from "../services/api";

function ConsultarFiltros() {
  const [data, setData] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha: "",
    nombre: "",
    ubicacion: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getDispositivos();
    setData(res.data);
  };

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: "",
      nombre: "",
      ubicacion: ""
    });
  };

  const dataFiltrada = data.filter((d) => {
    return (
      (!filtros.fecha || d.fecha_registro?.includes(filtros.fecha)) &&
      (!filtros.nombre || d.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
      (!filtros.ubicacion || d.ubicacion?.toLowerCase().includes(filtros.ubicacion.toLowerCase()))
    );
  });

  return (
    <div className="filtros-wrapper">

      {/* 🔹 TÍTULO */}
      <h2 className="filtros-title">Consulta Con Filtros</h2>

      {/* 🔍 BARRA */}
      <div className="filtros-bar">

        <span className="filtros-label">Filtrar Por</span>

        <input
          type="date"
          name="fecha"
          value={filtros.fecha}
          onChange={handleChange}
        />

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={filtros.nombre}
          onChange={handleChange}
        />

        <input
          type="text"
          name="ubicacion"
          placeholder="Ubicación"
          value={filtros.ubicacion}
          onChange={handleChange}
        />

        <button className="btn-clear" onClick={limpiarFiltros}>
          Borrar Filtro
        </button>

      </div>

      {/* 📋 TABLA */}
      <div className="filtros-card">
        <table className="filtros-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Fecha Registro</th>
              <th>Serial</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {dataFiltrada.length === 0 ? (
              <tr>
                <td colSpan="6">No hay resultados</td>
              </tr>
            ) : (
              dataFiltrada.map((d) => (
                <tr key={d.id}>
                  
                  <td>{d.nombre}</td>
                  <td>{d.ubicacion}</td>
                  <td>
                    {d.fecha_registro?.split("T")[0]}
                    <br />
                    <span className="hora">
                      {d.hora_registro || ""}
                    </span>
                  </td>
                  <td>{d.serial}</td>
                  <td>
                    <span className={`badge ${d.estado.toLowerCase()}`}>
                      {d.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default ConsultarFiltros;