import { useState } from "react";
import api from "../services/api";

function CambiarContrasena() {

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [contrasena, setContrasena] = useState("");

  const cambiar = async () => {

    try {

      await api.put("/usuarios/cambiar-contrasena", {
        id: usuario.id,
        contrasena: contrasena
      });

      alert("Contraseña actualizada");

      setContrasena("");

    } catch (error) {

      alert("Error al cambiar contraseña");

    }

  };

  return (

    <div style={{
      maxWidth: "400px",
      margin: "125px auto",
      padding: "35px",
      borderRadius: "12px",
      background: "var(--bg-card)",
      boxShadow: "var(--shadow)"
    }}>

      <h2 style={{ 
          marginBottom: "5px",
          textAlign: "center",
          color: "var(--text-main)"
        }}>Cambiar contraseña</h2>

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          background: "var(--input-bg)",
          color: "var(--text-main)",
          marginBottom: "20px",
          fontSize: "14px"
        }}
      />

      <button
        onClick={cambiar}
        style={{
          width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(to right, #0984e3, #74b9ff)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px",
            marginTop: "15px",
        }}
      >
        Actualizar contraseña
      </button>

    </div>
  );
}

export default CambiarContrasena;