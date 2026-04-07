import { useEffect, useState } from "react";
import { getDispositivos, updateDispositivo } from "../services/api";
import "./CSS/GestionMantenimiento.css";

function GestionMantenimiento() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getDispositivos();
      const filtrados = res.data.filter(d => 
  d.estado === "En Revision" || d.estado === "Listo para Entrega"
);
      setDispositivos(filtrados);
    } catch (error) {
      console.error(error);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    setLoading(true);
    try {
      await updateDispositivo(id, { estado: nuevoEstado });
      loadData();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar estado");
    } finally {
      setLoading(false);
    }
  };
  const getBadgeClass = (estado) => {
  switch (estado) {
    case "Listo para Entrega": return "badge-listo para-entrega";
    case "En Revision": return "badge-revision";
    case "En Mantenimiento": return "badge-mantenimiento";
    case "Entregado": return "badge-entregado";
    default: return "";
  }
};

 return (
  <div className="mant-wrapper">
<div className="mant-wrapper-tittle">
    <h1>Gestión de mantenimiento</h1>
</div>

  <div className="mant-card">
    <div className="mant-card-title">
      <div className="mant-dot"></div>
      <span>Lista de dispositivos</span>
    </div>

    <div className="mant-table-wrap">
      <table className="mant-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Serial</th>
            <th>Estado actual</th>
            <th>Cambiar estado</th>
          </tr>
        </thead>

        <tbody>
          {dispositivos.map(d => (
            <tr key={d.id}>
              <td>{d.nombre}</td>
              <td>{d.serial}</td>

              <td>
                <span className={`mant-badge ${getBadgeClass(d.estado)}`}>
                  {d.estado}
                </span>
              </td>

              <td>
                <select
                  className="mant-select"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) cambiarEstado(d.id, e.target.value);
                  }}
                >
                  <option value="">cambiar estado</option>
                  {d.estado === "En Revision" && (
                    <option value="En Mantenimiento">En Mantenimiento</option>
                  )}
                  {d.estado === "Listo para Entrega" && (
                    <option value="Entregado">Entregado</option>
                  )}
                </select>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
</div>
);
}

export default GestionMantenimiento;