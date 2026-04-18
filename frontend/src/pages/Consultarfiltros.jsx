import { useEffect, useState } from "react";
import "./CSS/ConsultarFiltros.css";
import { getDispositivos } from "../services/api";

function ConsultarFiltros() {
  const [data, setData] = useState([]);
  const [filtros, setFiltros] = useState({ fecha: "", nombre: "", ubicacion: "", estado: "" });
  const esSuperAdmin = JSON.parse(localStorage.getItem('usuario') || '{}').rol === 'super_admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getDispositivos();
    console.log('dispositivos en Consultar filtros',res.data); // AGREGA ESTO
    setData(res.data);
  };

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: "",
      nombre: "",
      ubicacion: "",
      estado: "",
    });
  };

  const dataFiltrada = data.filter((d) => {
    return (
      (!filtros.fecha || d.fecha_registro?.includes(filtros.fecha)) &&
      (!filtros.nombre || d.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
      (!filtros.ubicacion || d.ubicacion?.toLowerCase().includes(filtros.ubicacion.toLowerCase())) &&
      (!filtros.estado || d.estado === filtros.estado)
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

        <select
          name="estado"
          value={filtros.estado}
          onChange={handleChange}
          className="filtros-select"
        >
          <option value="">Estado</option>
          <option value="En Revision">En Revision</option>
          <option value="En Mantenimiento">En Mantenimiento</option>
          <option value="Listo para Entrega">Listo para Entrega</option>
          <option value="Entregado">Entregado</option>
        </select>

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
              {esSuperAdmin && <th>Registrado por</th>}
            </tr>
          </thead>

          <tbody>
            {dataFiltrada.length === 0 ? (
              <tr><td colSpan={esSuperAdmin ? 6 : 5}>No hay resultados</td></tr>
            ) : (
              dataFiltrada.map((d) => (
                <tr key={d.id}>
                  <td>{d.nombre}</td>
                  <td>{d.ubicacion}</td>
                  <td>
                    {d.fecha_registro
                      ? new Date(d.fecha_registro).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                    <br />
                    <span className="hora">{d.hora_registro || ""}</span>
                  </td>
                  <td>{d.serial}</td>
                  <td>
                    <span className={` ${d.estado.toLowerCase()}`}>{d.estado}</span>
                  </td>
                  {esSuperAdmin && (
                    <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                      {d.registrado_por || '—'}
                    </td>
                  )}
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