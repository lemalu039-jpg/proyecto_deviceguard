import { useState } from "react";
import "./CSS/Correo.css";

function Correo() {

  const [mensaje, setMensaje] = useState("");
  const [destino, setDestino] = useState("");

  const handleEnviar = async () => {
    await enviarCorreo({
      destino,
      asunto: "Notificación del sistema",
      mensaje
    });

    alert("Correo enviado");
    setMensaje("");
  };

  return (
    <div className="correo-wrapper">

  {/* SIDEBAR */}
  <div className="correo-sidebar">
    <button className="btn-redactar">Redactar</button>

    <ul>
      <li>Bandeja de Entrada</li>
      <li>Destacado</li>
      <li>Enviado</li>
      <li>Papelera</li>
    </ul>
  </div>

  {/* MAIN */}
  <div className="correo-main">

    <div className="correo-header">
      Laura Avila
    </div>

    <div className="correo-chat">
      <div className="mensaje recibido">
        Mensaje recibido de prueba...
      </div>

      <div className="mensaje enviado">
        Respuesta enviada desde el sistema
      </div>
    </div>

    <div className="correo-input">
      <input placeholder="Correo destino" />
      <input placeholder="Escribe mensaje..." />
      <button>Enviar</button>
    </div>

  </div>
</div>
  );
}

export default Correo;