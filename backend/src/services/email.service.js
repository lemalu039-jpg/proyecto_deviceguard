const nodemailer = require("nodemailer");
const db = require("../database/connection");
// dotenv ya cargado por server.js con path absoluto

const plantillaHTML = ({ titulo, color, icono, filas, nota }) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f2f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f8;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
        <tr>
          <td style="background:linear-gradient(135deg,#151E3D,#0492C2);padding:28px 32px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">${icono}</div>
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${titulo}</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Sistema DeviceGuard</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8ecf4;border-radius:10px;overflow:hidden;">
              ${filas.map((f, i) => `
              <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
                <td style="padding:11px 16px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;width:38%;border-bottom:1px solid #f1f5f9;">${f.label}</td>
                <td style="padding:11px 16px;font-size:13px;color:#1e293b;font-weight:500;border-bottom:1px solid #f1f5f9;">${f.valor}</td>
              </tr>`).join('')}
            </table>
            ${nota ? `<p style="margin:20px 0 0;padding:14px 16px;background:#f0f9ff;border-left:4px solid ${color};border-radius:0 8px 8px 0;font-size:13px;color:#334155;line-height:1.6;">${nota}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e8ecf4;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">Mensaje automático de <strong>DeviceGuard</strong>. No responder.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const EVENTOS = {
  REGISTRO: "registro",
  INICIO_MANTENIMIENTO: "inicio_mantenimiento",
  FIN_MANTENIMIENTO: "fin_mantenimiento",
  SALIDA: "salida",
};

const construirCorreo = (evento, datos = {}) => {
  const fecha = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  const hora  = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  switch (evento) {
    case EVENTOS.REGISTRO:
      return {
        asunto: "Nuevo dispositivo registrado — DeviceGuard",
        resumen: `Dispositivo "${datos.nombre}" registrado en el sistema`,
        html: plantillaHTML({
          titulo: "Nuevo Dispositivo Registrado", color: "#0492C2", icono: "",
          filas: [
            { label: "Dispositivo", valor: datos.nombre    || "—" },
            { label: "Serial",      valor: datos.serial    || "—" },
            { label: "Marca",       valor: datos.marca     || "—" },
            { label: "Tipo",        valor: datos.tipo      || "—" },
            { label: "Ubicación",   valor: datos.ubicacion || "—" },
            { label: "Estado",      valor: "En Revisión" },
            { label: "Fecha",       valor: fecha },
            { label: "Hora",        valor: hora },
          ],
          nota: "El dispositivo ha ingresado al sistema y está pendiente de revisión.",
        }),
      };

    case EVENTOS.INICIO_MANTENIMIENTO:
      return {
        asunto: "Inicio de mantenimiento — DeviceGuard",
        resumen: `Dispositivo "${datos.nombre || datos.id}" inició mantenimiento`,
        html: plantillaHTML({
          titulo: "Inicio de Mantenimiento", color: "#c2410c", icono: "",
          filas: [
            { label: "Dispositivo", valor: datos.nombre || `ID ${datos.id}` },
            { label: "Serial",      valor: datos.serial || "—" },
            { label: "Estado",      valor: "En Mantenimiento" },
            { label: "Fecha",       valor: fecha },
            { label: "Hora",        valor: hora },
          ],
          nota: "El dispositivo ha iniciado proceso de mantenimiento.",
        }),
      };

    case EVENTOS.FIN_MANTENIMIENTO:
      return {
        asunto: "Mantenimiento finalizado — DeviceGuard",
        resumen: `Dispositivo "${datos.nombre || datos.id}" listo para entrega`,
        html: plantillaHTML({
          titulo: "Mantenimiento Finalizado", color: "#059669", icono: "",
          filas: [
            { label: "Dispositivo", valor: datos.nombre || `ID ${datos.id}` },
            { label: "Serial",      valor: datos.serial || "—" },
            { label: "Estado",      valor: "Listo para Entrega" },
            { label: "Fecha",       valor: fecha },
            { label: "Hora",        valor: hora },
          ],
          nota: "El mantenimiento ha concluido. El dispositivo está listo para ser entregado.",
        }),
      };

    case EVENTOS.SALIDA:
      return {
        asunto: "Salida de dispositivo registrada — DeviceGuard",
        resumen: `Dispositivo "${datos.nombre || datos.id}" entregado`,
        html: plantillaHTML({
          titulo: "Salida de Dispositivo", color: "#15803d", icono: "",
          filas: [
            { label: "Dispositivo",  valor: datos.nombre       || `ID ${datos.id}` },
            { label: "Serial",       valor: datos.serial       || "—" },
            { label: "Estado",       valor: "Entregado" },
            { label: "Fecha salida", valor: datos.fecha_salida || fecha },
            { label: "Hora salida",  valor: datos.hora_salida  || hora },
          ],
          nota: "El dispositivo ha sido entregado correctamente al cliente.",
        }),
      };

    default:
      return { asunto: "Notificación DeviceGuard", resumen: datos.mensaje || "", html: `<p>${datos.mensaje || ""}</p>` };
  }
};

const enviarCorreo = async ({ destinatario, asunto, mensaje, evento, datos, usuario_id }) => {
  console.log("=== enviarCorreo llamado ===");
  console.log("destinatario:", destinatario);
  console.log("evento:", evento);
  console.log("EMAIL_USER en runtime:", process.env.EMAIL_USER);

  const ahora = new Date();
  const fechaDB = ahora.toISOString().split("T")[0];
  const horaDB  = ahora.toTimeString().slice(0, 5);

  let subject, htmlContent, resumenDB;

  if (evento) {
    const correo = construirCorreo(evento, datos || {});
    subject     = correo.asunto;
    htmlContent = correo.html;
    resumenDB   = correo.resumen;
  } else {
    subject     = asunto || "Notificación DeviceGuard";
    htmlContent = `<div style="font-family:Arial,sans-serif;padding:24px;color:#334155;"><pre style="white-space:pre-wrap;">${mensaje || ""}</pre></div>`;
    resumenDB   = mensaje || "";
  }

  console.log("subject:", subject);

  // Resolver usuario_id si no viene explícito — buscar por correo destinatario
  let resolvedUsuarioId = usuario_id || null;
  if (!resolvedUsuarioId && destinatario) {
    try {
      const [rows] = await db.query("SELECT id FROM usuarios WHERE correo = ? LIMIT 1", [destinatario]);
      if (rows.length > 0) resolvedUsuarioId = rows[0].id;
    } catch (_) {}
  }

  // 1. Guardar en BD siempre
  try {
    const result = await db.query(
      "INSERT INTO correos (destinatario, asunto, mensaje, fecha_envio, hora_envio, usuario_id) VALUES (?, ?, ?, ?, ?, ?)",
      [destinatario, subject, resumenDB, fechaDB, horaDB, resolvedUsuarioId]
    );
    console.log(" Correo guardado en BD. InsertId:", result[0]?.insertId);
  } catch (dbError) {
    console.error(" Error guardando correo en BD:", dbError.message);
    console.error("   SQL State:", dbError.sqlState);
    console.error("   SQL Message:", dbError.sqlMessage);
  }

  // 2. Enviar por nodemailer
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("📤 Intentando enviar email...");
    console.log("   FROM:", process.env.EMAIL_USER);
    console.log("   TO:  ", destinatario);
    console.log("   SUBJECT:", subject);

    // Verificar credenciales antes de enviar
    await transporter.verify();
    console.log("✅ Conexión SMTP verificada correctamente");

    const info = await transporter.sendMail({
      from: `"DeviceGuard" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject,
      html: htmlContent,
    });
    console.log("✅ Correo enviado. MessageId:", info.messageId);
    console.log("   Accepted:", info.accepted);
    console.log("   Rejected:", info.rejected);
  } catch (mailError) {
    console.error("❌ Error enviando email:", mailError.message);
    console.error("   Código:", mailError.code);
    console.error("   Respuesta SMTP:", mailError.response || "—");
  }
};

module.exports = { enviarCorreo, EVENTOS };
