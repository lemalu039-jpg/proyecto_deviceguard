import { useEffect, useState } from "react";
import { getDispositivos, updateDispositivo } from "../services/api";
import "./CSS/GestionMantenimiento.css";
import Pagination from "../components/Pagination";
import { useLanguage } from "../context/LanguageContext.jsx";

function GestionMantenimiento() {
  const { t } = useLanguage();
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
      const user = JSON.parse(localStorage.getItem('usuario') || '{}');
      const isAdmin = user.rol === 'admin' || user.rol === 'super_admin';
      
      const filtrados = res.data.filter(d => {
        const estadoValido = d.estado === "En Revision" || d.estado === "Listo para Entrega" || d.estado === "En Mantenimiento";
        if (!estadoValido) return false;
        
        // Si no es admin, solo ve los que le fueron asignados
        if (!isAdmin && d.tecnico_id !== user.id) return false;
        
        return true;
      });
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
      alert(t('mant_error_actualizar'));
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
      <h1 className="page-title">{t('mant_title')}</h1>
</div>

  <div className="mant-card">
    <div className="mant-card-title">
      <div className="mant-dot"></div>
      <span>{t('dash_lista_dispositivos')}</span>
    </div>

    <div className="mant-table-wrap">
      <table className="mant-table">
        <thead>
          <tr>
            <th>{t('dash_col_nombre')}</th>
            <th>{t('dash_col_serial')}</th>
            <th>{t('dash_col_reg_por')}</th>
            <th>{t('mant_col_estado_actual')}</th>
            <th>{t('mant_col_cambiar_estado')}</th>
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
                  <option value="">{t('mant_cambiar_estado')}</option>
                  {d.estado === "En Revision" && (
                    <option value="En Mantenimiento">{t('dash_en_mantenimiento')}</option>
                  )}
                  {d.estado === "Listo para Entrega" && (
                    <option value="Entregado">{t('dash_entregado')}</option>
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