import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import "./CSS/AjustesCuenta.css";

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function AjustesCuenta({ onLogout }) {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [correo, setCorreo] = useState(usuario.correo || "");
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  const actualizarCorreo = async () => {
    if (!correo) return alert("Ingresa un correo");
    try {
      await api.put("/usuarios/cambiar-correo", { id: usuario.id, correo });
      alert("Correo actualizado correctamente");
      const updatedUser = { ...usuario, correo };
      localStorage.setItem("usuario", JSON.stringify(updatedUser));
    } catch (error) {
      console.error(error);
      alert("Error al actualizar correo");
    }
  };

  const actualizarContrasena = async () => {
    if (!contrasenaActual || !nuevaContrasena) return alert("Llena todos los campos");
    try {
      await api.put("/usuarios/cambiar-contrasena", {
        id: usuario.id,
        contrasenaActual,
        nuevaContrasena
      });
      alert("Contraseña actualizada correctamente");
      setContrasenaActual("");
      setNuevaContrasena("");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar contraseña. Verifica tu contraseña actual.");
    }
  };

  return (
    <div className="ajustes-wrapper">
      <div className="ajustes-header">
        <h1 className="page-title">Ajustes de Cuenta</h1>
        <p>Administra tu configuración personal y preferencias del sistema</p>
      </div>

      <div className="ajustes-grid">
        {/* Cambiar Correo */}
        <div className="ajustes-card">
          <div className="ajustes-card-icon">
            <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />
          </div>
          <h3 className="ajustes-card-title">Dirección de correo</h3>
          <p className="ajustes-card-desc">Actualiza el correo electrónico asociado a tu cuenta para notificaciones y acceso.</p>
          <div className="ajustes-card-content">
            <input 
              type="email" 
              className="ajustes-input" 
              placeholder="Nuevo correo electrónico" 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <button className="ajustes-btn ajustes-btn-primary" onClick={actualizarCorreo}>
              Guardar Correo
            </button>
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div className="ajustes-card">
          <div className="ajustes-card-icon">
            <Icon d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </div>
          <h3 className="ajustes-card-title">Cambiar Contraseña</h3>
          <p className="ajustes-card-desc">Es recomendable usar una contraseña segura que no utilices en otros sitios.</p>
          <div className="ajustes-card-content">
            <input 
              type="password" 
              className="ajustes-input" 
              placeholder="Contraseña actual" 
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
            />
            <input 
              type="password" 
              className="ajustes-input" 
              placeholder="Nueva contraseña" 
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
            />
            <button className="ajustes-btn ajustes-btn-primary" onClick={actualizarContrasena}>
              Actualizar Contraseña
            </button>
          </div>
        </div>

        {/* Preferencias Visuales */}
        <div className="ajustes-card">
          <div className="ajustes-card-icon">
            <Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </div>
          <h3 className="ajustes-card-title">Preferencias de Tema</h3>
          <p className="ajustes-card-desc">Cambia la apariencia del sistema entre el modo claro y oscuro.</p>
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

        {/* Peligro: Cerrar sesión */}
        <div className="ajustes-card" style={{ borderLeft: "4px solid var(--danger)" }}>
          <div className="ajustes-card-icon" style={{ color: "var(--danger)" }}>
            <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </div>
          <h3 className="ajustes-card-title" style={{ color: "var(--danger)" }}>Cerrar Sesión</h3>
          <p className="ajustes-card-desc">Finalizará tu sesión en el sistema. Tendrás que volver a ingresar tus credenciales para acceder.</p>
          <div className="ajustes-card-content" style={{ marginTop: "auto" }}>
            <button className="ajustes-btn ajustes-btn-danger" onClick={onLogout}>
              Cerrar sesión de forma segura
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AjustesCuenta;
