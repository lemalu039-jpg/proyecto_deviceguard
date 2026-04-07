import { useEffect, useState } from "react";
import { getCorreos } from "../services/api";
import "./CSS/Correo.css";

function Correo() {
  const [correos, setCorreos] = useState([]);

  useEffect(() => {
    loadCorreos();
  }, []);

  const loadCorreos = async () => {
    try {
      const res = await getCorreos();
      setCorreos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="correo-wrapper">

      <div className="correo-card">
        <div className="correo-card-title">
          <div className="correo-card-dot"></div>
          <span>Historial de correos</span>
          <span className="correo-count">{correos.length} enviados</span>
        </div>

        <div className="correo-table-wrap">
          <table className="correo-table">
            <thead>
              <tr>
                <th>Destinatario</th>
                <th>Asunto</th>
                <th>Mensaje</th>
                <th>Fecha</th>
                <th>Hora</th>
              </tr>
            </thead>

            <tbody>
              {correos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="correo-empty">
                    No hay correos registrados
                  </td>
                </tr>
              ) : (
                correos.map(c => (
                  <tr key={c.id}>
                    <td>{c.destinatario}</td>
                    <td>{c.asunto}</td>
                    <td>{c.mensaje}</td>
                    <td>{c.fecha_envio}</td>
                    <td>{c.hora_envio}</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}

export default Correo;