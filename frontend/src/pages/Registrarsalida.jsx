import { useState, useEffect } from "react";
import { Modal } from 'bootstrap';
import {
  getDispositivos,
  getDispositivoBySerial,
  updateDispositivo
} from "../services/api";
import "./CSS/Registrarsalida.css";
import Pagination from "../components/Pagination";
import { useLanguage } from "../context/LanguageContext.jsx";

function SalidaDispositivos() {
  const { t } = useLanguage();
  const [salidas, setSalidas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    serial: "", fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5), estado: ""
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const esSuperAdmin = (JSON.parse(localStorage.getItem('usuario')||'{}')).rol === 'super_admin';
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getDispositivos();
      setSalidas(res.data);
    } catch (error) {
      console.error("Error cargando:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirModal = () => {
    setEditandoId(null);
    setForm({
      serial: "",
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().slice(0, 5),
      estado: ""
    });
    const modal = new Modal(document.getElementById('salidaModal'));
    modal.show();
  };

  const cerrarModal = () => {
    const modalEl = document.getElementById('salidaModal');
    const modal = Modal.getInstance(modalEl);
    if (modal) modal.hide();
  };

  const handleBuscar = async () => {
    if (!form.serial) return;
    try {
      const res = await getDispositivoBySerial(form.serial);
      const dispositivo = res.data;
      if (dispositivo) {
        setForm(prev => ({ ...prev, estado: dispositivo.estado }));
      }
    } catch (err) {
      console.error(err);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await getDispositivoBySerial(form.serial);
    const dispositivo = res.data;

    if (!dispositivo) {
      alert(t('salida_disp_no_existe'));
      return;
    }

    if (dispositivo.estado !== "En Mantenimiento") {
      alert(t('salida_solo_mantenimiento'));
      return;
    }

    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora  = ahora.toTimeString().slice(0, 5);

    await updateDispositivo(dispositivo.id, {
      estado: "Listo para Entrega",
      fecha_salida: fecha,
      hora_salida: hora,
    });

    cerrarModal();
    loadData();

  } catch (err) {
    console.error(err);
    alert(t('salida_err_registrar'));
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    if (window.confirm(t('salida_confirm_finalizar'))) {
      const dispositivo = salidas.find(d => d.id === id);
      if (!dispositivo) return;
      await updateDispositivo(id, {
        estado: "Disponible",
        fecha_salida: null,
        hora_salida: null
      });
      loadData();
    }
  };

  const handleEdit = (s) => {
    setForm({
      serial: s.serial,
      fecha: s.fecha_salida || new Date().toISOString().split("T")[0],
      hora: s.hora_salida || new Date().toTimeString().slice(0, 5),
      estado: s.estado || ""
    });
    setEditandoId(s.id);
    const modal = new Modal(document.getElementById('salidaModal'));
    modal.show();
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Listo para Entrega':       return 'badge-listo para-entrega';
      case 'En Revision':      return 'badge-revision';
      case 'En Mantenimiento': return 'badge-mantenimiento';
      case 'Entregado':     return 'badge-entregado';
      default:                 return 'badge-inactivo';
    }
  };

  const filteredSalidas = salidas.filter(s => {
    const okEstadoBase = s.estado === "En Mantenimiento";
    const texto = `${s.serial} ${s.nombre || ''} ${s.ubicacion || ''}`.toLowerCase();
    const okBusqueda = !filtroBusqueda || texto.includes(filtroBusqueda.toLowerCase());
    const okEstado = !filtroEstado || s.estado === filtroEstado;
    return okEstadoBase && okBusqueda && okEstado;
  });

  return (
    <div className="salida-wrapper">

      <div className="salida-banner">
        <div className="salida-banner-lines"></div>
        <div className="salida-banner-content">
          <h2>{t('salida_title')}</h2>
          <p>{t('salida_subtitle')}</p>
          <button className="salida-banner-btn" onClick={abrirModal}>
            {t('salida_btn_registrar')}
          </button>
        </div>
      </div>

      <div className="modal fade" id="salidaModal" tabIndex="-1" aria-labelledby="salidaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title" id="salidaModalLabel">
                {editandoId ? t('salida_editar') : t('salida_modal_title')}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label={t('cerrar')}></button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit} id="salida-form">
                <div className="row g-3">

                  <div className="col-12">
                    <label className="salida-modal-label">{t('salida_modal_serial')}</label>
                    <input
                      type="text"
                      name="serial"
                      value={form.serial}
                      onChange={handleChange}
                      onBlur={handleBuscar}
                      placeholder={t('salida_modal_serial_ph')}
                      required
                      className="salida-modal-input"
                      disabled={editandoId != null}
                    />

                  </div>
                  <div className="col-12">
  <label className="salida-modal-label">{t('salida_modal_info')}</label>
  <p className="salida-info-text">
    {t('salida_modal_info_desc')}
  </p>
</div>

                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="salida-btn-cancel" data-bs-dismiss="modal">
                {t('cerrar')}
              </button>
              <button type="submit" form="salida-form" className="salida-btn-primary" disabled={loading}>
                {loading ? t('historial_guardando') : editandoId ? t('salida_btn_actualizar') : t('salida_btn_registrar')}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="salida-card">
        <div className="salida-card-title">
          <div className="salida-card-dot"></div>
          <span>{t('dash_lista_dispositivos')}</span>
          <span className="salida-count">{salidas.length} {t('correo_registros')}</span>
        </div>
        {/* Filtros */}
        <div style={{ display: 'flex', gap: '.5rem', padding: '.75rem 1.25rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={t('salida_buscar_ph')}
            value={filtroBusqueda}
            onChange={e => { setFiltroBusqueda(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1, minWidth: '160px', padding: '.38rem .7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '.78rem', outline: 'none', fontWeight: 400 }}
          />
          {(filtroBusqueda || filtroEstado) && (
            <button onClick={() => { setFiltroBusqueda(''); setFiltroEstado(''); }} style={{ padding: '.38rem .7rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer' }}>
              {t('dash_limpiar')}
            </button>
          )}
        </div>

        <div className="salida-table-wrap">
          <table className="salida-table">
            <thead>
              <tr>
                <th>{t('dash_col_serial')}</th>
                <th>{t('salida_col_fecha_ent')}</th>
                <th>{t('salida_col_fecha_sal')}</th>
                <th>{t('dash_col_estado')}</th>
                {esSuperAdmin && <th>{t('dash_col_reg_por')}</th>}
              </tr>
            </thead>
            <tbody>
              {filteredSalidas.length === 0 ? (
                <tr><td colSpan={esSuperAdmin ? 5 : 4} className="salida-empty">{t('salida_no_registros')}</td></tr>
              ) : (
                filteredSalidas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.serial}</td>
                    <td>
                      {s.fecha_registro
                        ? new Date(s.fecha_registro).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-'}
                      <br />
                      <span className="salida-hora">{s.hora_registro || new Date(s.fecha_registro).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td>
                      {s.fecha_salida
                        ? new Date(s.fecha_salida).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-'}
                      <br />
                      <span className="salida-hora">{s.hora_salida || '-'}</span>
                    </td>
                    <td><span className={getBadgeClass(s.estado)}>{s.estado}</span></td>
                    {esSuperAdmin && (
                      <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {s.registrado_por || '-'}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination
          totalItems={filteredSalidas.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
}

export default SalidaDispositivos;
