import { useState, useEffect } from "react";
import { getCalificaciones } from "../services/api";

const Estrellas = ({ valor }) => (
  <span>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= valor ? "#0492C2" : "#d1d5db", fontSize: "1rem" }}>★</span>
    ))}
  </span>
);

function Calificaciones() {
  const [calificaciones, setCalificaciones] = useState([]);
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [filtroEstrellas, setFiltroEstrellas] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCalificaciones()
      .then(res => setCalificaciones(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tecnicos = [...new Set(calificaciones.map(c => c.tecnico_nombre).filter(Boolean))];

  const filtradas = calificaciones.filter(c => {
    const matchTecnico = !filtroTecnico || c.tecnico_nombre === filtroTecnico;
    const matchEstrellas = !filtroEstrellas || c.estrellas_empresa === parseInt(filtroEstrellas);
    const matchBusqueda = !busqueda ||
      c.serial?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.dispositivo_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.comentario?.toLowerCase().includes(busqueda.toLowerCase());
    return matchTecnico && matchEstrellas && matchBusqueda;
  });

  const promedioEmpresa = calificaciones.length
    ? (calificaciones.reduce((a, c) => a + c.estrellas_empresa, 0) / calificaciones.length).toFixed(1)
    : "—";

  const promedioTecnico = calificaciones.filter(c => c.estrellas_tecnico).length
    ? (calificaciones.filter(c => c.estrellas_tecnico).reduce((a, c) => a + c.estrellas_tecnico, 0) / calificaciones.filter(c => c.estrellas_tecnico).length).toFixed(1)
    : "—";

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem", color: "var(--text-main)" }}>
        Calificaciones
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Reseñas de clientes sobre el servicio
      </p>

      {/* Tarjetas resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.2rem", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 4px" }}>Total reseñas</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>{calificaciones.length}</p>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.2rem", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 4px" }}>Promedio empresa</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-muted)", margin: 0 }}>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="#0492C2"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>{" "}
  {promedioEmpresa}
</p>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.2rem", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 4px" }}>Promedio técnicos</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-muted)", margin: 0 }}>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="#0492C2"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>{" "}
  {promedioTecnico}
</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <input
          placeholder="Buscar por serial, dispositivo o comentario..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: "200px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)", fontSize: "0.83rem", outline: "none" }}
        />
        <select value={filtroTecnico} onChange={e => setFiltroTecnico(e.target.value)}
          style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)", fontSize: "0.83rem" }}>
          <option value="">Todos los técnicos</option>
          {tecnicos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filtroEstrellas} onChange={e => setFiltroEstrellas(e.target.value)}
          style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-main)", fontSize: "0.83rem" }}>
          <option value="">Todas las estrellas</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Cargando...</p>
      ) : filtradas.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>Sin calificaciones</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtradas.map(c => (
            <div key={c.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "var(--text-main)", fontSize: "0.9rem" }}>
                    {c.dispositivo_nombre} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {c.serial}</span>
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Técnico: {c.tecnico_nombre || "No asignado"}
                  </p>
                </div>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {new Date(c.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <div style={{ display: "flex", gap: "1.5rem", margin: "0.6rem 0 0.4rem", flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>Empresa</p>
                  <Estrellas valor={c.estrellas_empresa} />
                </div>
                {c.estrellas_tecnico && (
                  <div>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>Técnico</p>
                    <Estrellas valor={c.estrellas_tecnico} />
                  </div>
                )}
              </div>
              {c.comentario && (
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.82rem", color: "var(--text-main)", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                  "{c.comentario}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Calificaciones;