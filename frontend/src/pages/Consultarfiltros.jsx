import { useEffect, useState } from "react";
import "./CSS/ConsultarFiltros.css";
import { getDispositivos } from "../services/api";
import Pagination from "../components/Pagination";
import { useLanguage } from "../context/LanguageContext.jsx";

function ConsultarFiltros() {
  const { t } = useLanguage();
  const [data, setData] = useState([]);
  const [filtros, setFiltros] = useState({ fecha: "", nombre: "", ubicacion: "", estado: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const esSuperAdmin = (JSON.parse(localStorage.getItem('usuario')||'{}')).rol === 'super_admin';

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
    setCurrentPage(1); // Reset page on filter change
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: "",
      nombre: "",
      ubicacion: "",
      estado: "",
    });
    setCurrentPage(1);
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
      <h2 className="filtros-title">{t('consulta_filtros_title')}</h2>

      {/* 🔍 BARRA */}
      <div className="filtros-bar">

        <span className="filtros-label">{t('filtrar')}</span>

        <input
          type="date"
          name="fecha"
          value={filtros.fecha}
          onChange={handleChange}
        />

        <input
          type="text"
          name="nombre"
          placeholder={t('dash_col_nombre')}
          value={filtros.nombre}
          onChange={handleChange}
        />

        <input
          type="text"
          name="ubicacion"
          placeholder={t('dash_col_ubicacion')}
          value={filtros.ubicacion}
          onChange={handleChange}
        />

        <select
          name="estado"
          value={filtros.estado}
          onChange={handleChange}
          className="filtros-select"
        >
          <option value="">{t('dash_col_estado')}</option>
          <option value="En Revision">{t('dash_en_revision')}</option>
          <option value="En Mantenimiento">{t('dash_en_mantenimiento')}</option>
          <option value="Listo para Entrega">{t('dash_listo_entrega')}</option>
          <option value="Entregado">{t('dash_entregado')}</option>
        </select>

        <button className="btn-clear" onClick={limpiarFiltros}>
          {t('limpiar_filtros')}
        </button>

      </div>

      {/* 📋 TABLA */}
      <div className="filtros-card">
        <table className="filtros-table">
          <thead>
            <tr>
              <th>{t('dash_col_nombre')}</th>
              <th>{t('dash_col_ubicacion')}</th>
              <th>{t('dash_col_fecha_reg')}</th>
              <th>{t('dash_col_serial')}</th>
              <th>{t('dash_col_estado')}</th>
              {esSuperAdmin && <th>{t('dash_col_reg_por')}</th>}
            </tr>
          </thead>

          <tbody>
            {dataFiltrada.length === 0 ? (
              <tr><td colSpan={esSuperAdmin ? 6 : 5}>{t('dash_no_dispositivos')}</td></tr>
            ) : (
              dataFiltrada.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((d) => (
                <tr key={d.id}>
                  <td>{d.nombre}</td>
                  <td>{d.ubicacion}</td>
                  <td>
                    {d.fecha_registro
                      ? new Date(d.fecha_registro).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                    <br />
                    <span className="hora">{d.hora_registro || new Date(d.fecha_registro).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
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
      
      <Pagination
        totalItems={dataFiltrada.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}

export default ConsultarFiltros;