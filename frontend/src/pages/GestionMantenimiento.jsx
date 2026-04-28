import { useEffect, useState } from "react";
import { getDispositivos, updateDispositivo } from "../services/api";
import "./CSS/GestionMantenimiento.css";
import Pagination from "../components/Pagination";

function GestionMantenimiento() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const itemsPerPage = 7;

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
      <h1 className="page-title">Gestión de mantenimiento</h1>
</div>

  <div className="mant-card">
    <div className="mant-card-title">
      <div className="mant-dot"></div>
      <span style={{ whiteSpace: 'nowrap' }}>Lista de dispositivos</span>
      <input
        type="text"
        placeholder="Buscar por nombre o serial..."
        value={busqueda}
        onChange={e => { setBusqueda(e.target.value); setCurrentPage(1); }}
        style={{ flex: 1, minWidth: '180px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none', fontWeight: 400 }}
      />
      <select
        value={filtroEstado}
        onChange={e => { setFiltroEstado(e.target.value); setCurrentPage(1); }}
        style={{ padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}
      >
        <option value="">Todos los estados</option>
        <option value="En Revision">En Revision</option>
        <option value="Listo para Entrega">Listo para Entrega</option>
      </select>
      {(busqueda || filtroEstado) && (
        <button onClick={() => { setBusqueda(''); setFiltroEstado(''); setCurrentPage(1); }} style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          Limpiar
        </button>
      )}
    </div>

    <div className="mant-table-wrap">
      <table className="mant-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Serial</th>
            <th>Registrado por</th>
            <th>Estado actual</th>
            <th>Cambiar estado</th>
          </tr>
        </thead>

        <tbody>
          {dispositivos
            .filter(d => {
              const okBusqueda = !busqueda || `${d.nombre} ${d.serial}`.toLowerCase().includes(busqueda.toLowerCase());
              const okEstado   = !filtroEstado || d.estado === filtroEstado;
              return okBusqueda && okEstado;
            })
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(d => (
            <tr key={d.id}>
              <td>{d.nombre}</td>
              <td>{d.serial}</td>
              <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                {d.registrado_por || '—'}
              </td>

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

    <Pagination
      totalItems={dispositivos.filter(d => {
        const okBusqueda = !busqueda || `${d.nombre} ${d.serial}`.toLowerCase().includes(busqueda.toLowerCase());
        const okEstado   = !filtroEstado || d.estado === filtroEstado;
        return okBusqueda && okEstado;
      }).length}
      itemsPerPage={itemsPerPage}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />

  </div>
</div>
);
}

export default GestionMantenimiento;