import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CambiarCorreo() {

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [correo, setCorreo] = useState("");

  const actualizarCorreo = async () => {
    try {

      await api.put("/usuarios/cambiar-correo", {
        id: usuario.id,
        correo: correo
      });

      alert("Correo actualizado correctamente");
      navigate("/dashboard");

    } catch (error) {

      console.error("ERROR:", error.response?.data || error.message);
      alert("Error al actualizar correo");

    }
  };

  return (

    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh"
    }}>

      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        width: "400px"
      }}>

        <h2 style={{
          marginBottom: "25px",
          textAlign: "center",
          color: "#2d3436"
        }}>
          Cambiar correo
        </h2>

        <input
          type="email"
          placeholder="Nuevo correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #dfe6e9",
            marginBottom: "20px",
            fontSize: "14px"
          }}
        />

        <button
          onClick={actualizarCorreo}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px"
          }}
        >
          Actualizar correo
        </button>

      </div>

    </div>
  );
}

export default CambiarCorreo;