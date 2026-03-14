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
      margin: "50px auto",
      padding: "30px",
      borderRadius: "10px",
      background: "white",
      boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
    }}>

      <h2>Cambiar contraseña</h2>

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "15px"
        }}
      />

      <button
        onClick={cambiar}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "10px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "5px"
        }}
      >
        Actualizar contraseña
      </button>

    </div>
  );
}

export default CambiarContrasena;