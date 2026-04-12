import { useState, useEffect } from "react";
import { Modal } from 'bootstrap';
import {
  getDispositivos,
  getDispositivoBySerial,
  updateDispositivo
} from "../services/api";
import "./CSS/Registrarsalida.css";

function SalidaDispositivos() {
  const [salidas, setSalidas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    serial: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    estado: ""
  });
  const [loading, setLoading] = useState(false);

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
      alert("El dispositivo no existe");
      return;
    }

    if (dispositivo.estado !== "En Mantenimiento") {
      alert("Solo puedes registrar salida si el dispositivo está en mantenimiento.");
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
    alert("Error al registrar salida");
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    if (window.confirm("¿Finalizar proceso del dispositivo?")) {
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

  return (
    <div className="salida-wrapper">

      <div className="salida-banner">
        <div className="salida-banner-lines"></div>
        <div className="salida-banner-content">
          <h2>Registrar Salida de Dispositivos</h2>
          <p>Gestiona la salida de equipos cuando finalizan su proceso</p>
          <button className="salida-banner-btn" onClick={abrirModal}>
            Registrar Salida
          </button>
        </div>
      </div>

      <div className="modal fade" id="salidaModal" tabIndex="-1" aria-labelledby="salidaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title" id="salidaModalLabel">
                {editandoId ? 'Editar salida' : 'Registrar salida de dispositivo'}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit} id="salida-form">
                <div className="row g-3">

                  <div className="col-12">
                    <label className="salida-modal-label">Serial del dispositivo</label>
                    <input
                      type="text"
                      name="serial"
                      value={form.serial}
                      onChange={handleChange}
                      onBlur={handleBuscar}
                      placeholder="Ej: ABC-123456"
                      required
                      className="salida-modal-input"
                      disabled={editandoId != null}
                    />

                  </div>
                  <div className="col-12">
  <label className="salida-modal-label">Información</label>
  <p className="salida-info-text">
    La salida se registra automáticamente (fecha, hora y estado).
  </p>
</div>

                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="salida-btn-cancel" data-bs-dismiss="modal">
                Cerrar
              </button>
              <button type="submit" form="salida-form" className="salida-btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editandoId ? 'Actualizar salida' : 'Registrar salida'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="salida-card">
        <div className="salida-card-title">
          <div className="salida-card-dot"></div>
          <span>Lista de dispositivos</span>
          <span className="salida-count">{salidas.length} registrados</span>
        </div>

        <div className="salida-table-wrap">
          <table className="salida-table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Fecha entrada</th>
                <th>Fecha salida</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {salidas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="salida-empty">No hay registros</td>
                </tr>
              ) : (
                salidas
                .filter(s => s.estado === "En Mantenimiento")
                .map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.serial}</td>
                    <td>
                      {s.fecha_registro?.split("T")[0]}
                      <br />
                      <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                        {s.hora_registro || '—'}
                      </span>
                    </td>
                    <td>
                      {s.fecha_salida ? s.fecha_salida.split("T")[0] : '—'}
                      <br />
                      <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                        {s.hora_salida || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={getBadgeClass(s.estado)}>
                        {s.estado}
                      </span>
                    </td>
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

export default SalidaDispositivos;
