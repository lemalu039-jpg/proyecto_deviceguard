import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./css/AjustesCuenta.css";

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function AjustesCuenta({ onLogout }) {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [correo, setCorreo] = useState(usuario.correo || "");
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  const actualizarCorreo = async () => {
    if (!correo) return alert(t('ingresa_correo') || "Ingresa un correo");
    try {
      await api.put("/usuarios/cambiar-correo", { id: usuario.id, correo });
      alert(t('correo_actualizado') || "Correo actualizado correctamente");
      const updatedUser = { ...usuario, correo };
      localStorage.setItem("usuario", JSON.stringify(updatedUser));
    } catch (error) {
      console.error(error);
      alert(t('error_correo') || "Error al actualizar correo");
    }
  };

  const actualizarContrasena = async () => {
    if (!contrasenaActual || !nuevaContrasena) return alert(t('llena_campos') || "Llena todos los campos");
    try {
      await api.put("/usuarios/cambiar-contrasena", {
        id: usuario.id,
        contrasenaActual,
        nuevaContrasena
      });
      alert(t('contrasena_actualizada') || "Contraseña actualizada correctamente");
      setContrasenaActual("");
      setNuevaContrasena("");
    } catch (error) {
      console.error(error);
      alert(t('error_contrasena') || "Error al actualizar contraseña. Verifica tu contraseña actual.");
    }
  };

  return (
    <div className="ajustes-wrapper">
      <div className="ajustes-header">
        <h1 className="page-title">{t('ajustes_cuenta')}</h1>
        <p>{t('ajustes_description')}</p>
      </div>

      <div className="ajustes-grid">
        {/* Cambiar Correo */}
        <div className="ajustes-card">
          <div className="ajustes-card-icon">
            <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />
          </div>
          <h3 className="ajustes-card-title">{t('direccion_correo')}</h3>
          <p className="ajustes-card-desc">{t('correo_desc')}</p>
          <div className="ajustes-card-content">
            <input 
              type="email" 
              className="ajustes-input" 
              placeholder={t('nuevo_correo')} 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <button className="ajustes-btn ajustes-btn-primary" onClick={actualizarCorreo}>
              {t('guardar_correo')}
            </button>
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div className="ajustes-card">
          <div className="ajustes-card-icon">
            <Icon d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </div>
          <h3 className="ajustes-card-title">{t('cambiar_contrasena')}</h3>
          <p className="ajustes-card-desc">{t('contrasena_desc')}</p>
          <div className="ajustes-card-content">
            <input 
              type="password" 
              className="ajustes-input" 
              placeholder={t('contrasena_actual')} 
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
            />
            <input 
              type="password" 
              className="ajustes-input" 
              placeholder={t('nueva_contrasena')} 
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
            />
            <button className="ajustes-btn ajustes-btn-primary" onClick={actualizarContrasena}>
              {t('actualizar_contrasena')}
            </button>
          </div>
        </div>

        {/* Preferencias Visuales */}
        <div className="ajustes-card">
          <div className="ajustes-card-icon">
            <Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </div>
          <h3 className="ajustes-card-title">{t('preferencias_tema')}</h3>
          <p className="ajustes-card-desc">{t('tema_desc')}</p>
          <div className="ajustes-card-content" style={{ alignItems: "flex-start", marginTop: "1rem" }}>
            <label className="cosmic-toggle" style={{ transform: "scale(1.2)", transformOrigin: "left center" }}>
              <input
                type="checkbox"
                className="l"
                checked={darkMode}
                onChange={toggleTheme}
              />
              <div className="slider">
                <div className="cosmos"></div>
                <div className="toggle-orb">
                  <div className="inner-orb"></div>
                  <div className="ring"></div>
                </div>
                <div className="energy-line"></div>
                <div className="energy-line"></div>
                <div className="energy-line"></div>
                <div className="particles">
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Selector de Idioma */}
        <div className="ajustes-card">
          <div className="ajustes-card-icon">
            <Icon d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </div>
          <h3 className="ajustes-card-title">{t('idioma')}</h3>
          <p className="ajustes-card-desc">{t('idioma_desc')}</p>
          <div className="ajustes-card-content" style={{ alignItems: "flex-start", marginTop: "1rem" }}>
            <select 
              className="ajustes-input" 
              value={language} 
              onChange={(e) => changeLanguage(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Peligro: Cerrar sesión */}
        <div className="ajustes-card" style={{ borderLeft: "4px solid var(--danger)" }}>
          <div className="ajustes-card-icon" style={{ color: "var(--danger)" }}>
            <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </div>
          <h3 className="ajustes-card-title" style={{ color: "var(--danger)" }}>{t('cerrar_sesion')}</h3>
          <p className="ajustes-card-desc">{t('cerrar_sesion_desc')}</p>
          <div className="ajustes-card-content" style={{ marginTop: "auto" }}>
            <button className="ajustes-btn ajustes-btn-danger" onClick={onLogout}>
              {t('cerrar_sesion_btn')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AjustesCuenta;
