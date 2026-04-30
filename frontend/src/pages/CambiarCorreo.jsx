import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext.jsx";

function CambiarCorreo() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [correo, setCorreo] = useState("");

  const actualizarCorreo = async () => {
    try {

      await api.put("/usuarios/cambiar-correo", {
        id: usuario.id,
        correo: correo
      });

      alert(t('perfil_correo_actualizado'));
      navigate("/dashboard");

    } catch (error) {

      console.error("ERROR:", error.response?.data || error.message);
      alert(t('perfil_err_correo'));

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
          }}>{t('perfil_cambiar_correo')}</h2>

        <input
          type="email"
          placeholder={t('perfil_nuevo_correo')}
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
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
          onClick={actualizarCorreo}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(to right, #0984e3, #74b9ff)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px"
          }}
        >
          {t('perfil_btn_correo')}
        </button>

      </div>

    </div>
  );
}

export default CambiarCorreo;