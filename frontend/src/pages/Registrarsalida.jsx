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
  const [form, setForm] = useState({
    serial: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5)
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  try {
    const res = await getDispositivos();
    setSalidas(res.data); // puedes dejar el nombre
  } catch (error) {
    console.error("Error cargando:", error);
  }
};

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    // 🔥 SI ESTÁ EDITANDO
    if (editandoId) {

  const dispositivoActual = salidas.find(d => d.id === editandoId);

  await updateDispositivo(editandoId, {
    ...dispositivoActual,
    fecha_salida: form.fecha,
    hora_salida: form.hora
  });

  setEditandoId(null);
}
    // 🔥 SI ES NUEVO
    else {
      if (dispositivo.estado === "En Prestamo") {
        alert("Este dispositivo ya está en préstamo");
        return;
      }

      await updateDispositivo(dispositivo.id, {
        ...dispositivo,
        estado: "En Prestamo ",
        fecha_salida: form.fecha,
        hora_salida: form.hora
      });
    }

    setForm({
      serial: "",
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().slice(0, 5)
    });

    loadData();

  } catch (err) {
    console.error(err);
    alert("Error");
  } finally {
    setLoading(false);
  }
};

 const handleDelete = async (id) => {
  if (window.confirm("¿Finalizar préstamo?")) {

    const dispositivo = salidas.find(d => d.id === id);

    await updateDispositivo(id, {
      ...dispositivo,
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
    hora: s.hora_salida || new Date().toTimeString().slice(0, 5)
  });

  setEditandoId(s.id);
};


  return (
  <div className="salida-wrapper">

    <h1>Salida de Dispositivos</h1>

    {/* FORMULARIO */}
    <form onSubmit={handleSubmit} className="salida-form">

      <input
        type="text"
        name="serial"
        placeholder="Serial del dispositivo"
        value={form.serial}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="fecha"
        value={form.fecha}
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

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Registrar salida"}
      </button>

    </form>

    {/* TABLA */}
    <table className="salida-table">
  <thead>
    <tr>
      <th>Serial</th>
      <th>Fecha Entrada</th>
      <th>Fecha Salida</th>
      <th>Hora Salida</th>
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

          <td> {s.fecha_registro?.split("T")[0]} <br /> <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.hora_registro || "—"} </span>
</td>

          <td>{s.fecha_salida || "—"}</td>

          <td>{s.hora_salida || "—"}</td>

          {/* ✅ ESTADO CON ESTILO */}
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

          {/* ✅ ACCIONES */}
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