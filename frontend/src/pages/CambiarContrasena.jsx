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
      background: "white",
      boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
    }}>

      <h2 style={{ 
          marginBottom: "5px",
          textAlign: "center",
          color: "#2d3436"
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
          border: "1px solid #dfe6e9",
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