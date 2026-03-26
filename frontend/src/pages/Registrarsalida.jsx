import { useState, useEffect } from "react";
import {
  getDispositivos,
  getDispositivoBySerial,
  updateDispositivo
} from "../services/api";
import "./CSS/Registrarsalida.css";

function SalidaDispositivos() {
  const [salidas, setSalidas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
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

  const handleBuscar = async () => {
  if (!form.serial) return;

  try {
    const res = await getDispositivoBySerial(form.serial);
    const dispositivo = res.data;

    if (dispositivo) {
      setForm(prev => ({
        ...prev,
        estado: dispositivo.estado
      }));
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

      const dispositivoActual = salidas.find(
        (d) => d.id === dispositivo.id
      );

      if (!dispositivoActual) {
        alert("Error: no se encontró el dispositivo en la lista");
        return;
      }

      // 🔥 EDITAR
      if (editandoId) {
        await updateDispositivo(editandoId, {
          fecha_salida: form.fecha,
          hora_salida: form.hora,
          estado: form.estado
        });

        setEditandoId(null);
      }

      // REGISTRAR SALIDA
      else {
        // Validación correcta
        if (dispositivoActual.estado !== "Disponible") {
    alert("No puedes registrar salida. El dispositivo no está disponible.");
    return;
  }
        await updateDispositivo(dispositivo.id, {
          estado: "Disponible",
          fecha_salida: form.fecha,
          hora_salida: form.hora
        });
      }

      // 🔄 Reset
      setForm({
        serial: "",
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().slice(0, 5),
        estado: ""
      });

      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error al registrar salida");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Finalizar proceso del dispositivo?")) {
      const dispositivo = salidas.find((d) => d.id === id);

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
      fecha:
        s.fecha_salida || new Date().toISOString().split("T")[0],
      hora:
        s.hora_salida || new Date().toTimeString().slice(0, 5)
    });

    setEditandoId(s.id);
  };

  return (
    <div className="salida-wrapper">
        <div className="salida-banner">
  <div className="salida-banner-lines"></div>

  <div>
    <h2>Registrar Salida de Dispositivos</h2>
    <p>
      Gestiona la salida de equipos cuando finalizan su proceso
    </p>

    <button onClick={() => {
  console.log("CLICK");
  setMostrarForm(true);
}}>
  Registrar Salida
</button>
  </div>
</div>

        <div className={`form-container ${mostrarForm ? "show" : ""}`}>
      {mostrarForm && (
  <form onSubmit={handleSubmit} className="salida-form">

    <input
      type="text"
      name="serial"
      placeholder="Serial del dispositivo"
      value={form.serial}
      onChange={handleChange}
      onBlur={handleBuscar}
      required
    />

    <input
      type="date"
      name="fecha"
      value={form.fecha.split("T")[0]}
      onChange={handleChange}
      required
    />

    <input
      type="time"
      name="hora"
      value={form.hora}
      onChange={handleChange}
      required
    />

    <select
  name="estado"
  value={form.estado}
  onChange={handleChange}
  required
>
  <option value="">Seleccionar estado</option>
  <option value="Disponible">Disponible</option>
  <option value="En Revision">En Revisión</option>
  <option value="En Mantenimiento">En Mantenimiento</option>
  <option value="Dado de Baja">Dado de Baja</option>
</select>

   <button type="submit" className="salida-btn-primary" disabled={loading}>
  {loading ? "Guardando..." : "Registrar salida"}
</button>

<button
  type="button"
  className="salida-btn-cancel"
  onClick={() => setMostrarForm(false)}
>
  Cancelar
</button>

  </form>
)}
</div>

      {/* TABLA */}
      <table className="salida-table">
        <thead>
          <tr>
            <th>Serial</th>
            <th>Fecha Entrada</th>
            <th>Fecha Salida</th>
        
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {salidas.length === 0 ? (
            <tr>
              <td colSpan="6">No hay registros</td>
            </tr>
          ) : (
            salidas.map((s) => (
              <tr key={s.id}>
                <td>{s.serial}</td>

                <td>
                  {s.fecha_registro?.split("T")[0]}
                  <br />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b"
                    }}
                  >
                    {s.hora_registro || "—"}
                  </span>
                </td>

                <td>
  {s.fecha_salida
    ? s.fecha_salida.split("T")[0]
    : "—"}
     <br />
  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
    {s.hora_salida || "—"}
  </span>
</td>

                <td>
                  <span
                    className={
                      s.estado === "Disponible"
                        ? "badge-disponible"
                        : "badge-prestamo"
                    }
                  >
                    {s.estado}
                  </span>
                </td>

                <td>
                  <button onClick={() => handleEdit(s)}>
                    Editar
                  </button>

                  <button onClick={() => handleDelete(s.id)}>
                    Finalizar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SalidaDispositivos;