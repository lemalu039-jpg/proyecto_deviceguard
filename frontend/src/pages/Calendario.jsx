import React, { useEffect, useState } from 'react';
import { getDispositivos } from '../services/api';


async function registrarSalidaAPI(dispositivo) {
  const response = await fetch(`/api/dispositivos/${dispositivo.id || dispositivo.id_dispositivo}/salida`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fecha_salida: new Date().toISOString(),
      id_dispositivo: dispositivo.id || dispositivo.id_dispositivo,
    }),
  });
  if (!response.ok) throw new Error('Error al registrar salida');
  return response.json();
}

function Calendario() {
  const [dispositivos, setDispositivos] = useState([]);
  const [fecha, setFecha] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({ id_dispositivo: '', fecha_estimada: '', nota: '' });

  // Modal confirmación de salida
  const [modalSalida, setModalSalida] = useState(false);
  const [eventoSalida, setEventoSalida] = useState(null);
  const [cargandoSalida, setCargandoSalida] = useState(false);
  const [mensajeSalida, setMensajeSalida] = useState('');

  // Modal detalle equipo
  const [modalDetalle, setModalDetalle] = useState(false);
  const [equipoDetalle, setEquipoDetalle] = useState(null);

  const [eventosCustom, setEventosCustom] = useState(() => {
    const saved = localStorage.getItem('eventosCustom');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    getDispositivos().then(res => setDispositivos(res.data)).catch(console.error);
  }, []);

  const year = fecha.getFullYear();
  const month = fecha.getMonth();

  const nombresMes = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const primerDia = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const diasEnMesAnterior = new Date(year, month, 0).getDate();

  const mesAnterior = () => setFecha(new Date(year, month - 1, 1));
  const mesSiguiente = () => setFecha(new Date(year, month + 1, 1));

  const hoy = new Date();
  const esHoy = (d) => d === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear();

  const eventosDia = (dia) => {
    const regEvents = dispositivos.filter(d => {
      if (!d.fecha_registro) return false;
      const f = new Date(d.fecha_registro);
      return f.getDate() === dia && f.getMonth() === month && f.getFullYear() === year;
    }).map(d => ({ ...d, isRegistro: true }));

    const customEvents = eventosCustom.filter(e => {
      if (!e.fecha_estimada) return false;
      const parts = e.fecha_estimada.split('-');
      if (parts.length === 3) {
        return parseInt(parts[2]) === dia && (parseInt(parts[1]) - 1) === month && parseInt(parts[0]) === year;
      }
      return false;
    }).map(e => {
      const disp = dispositivos.find(d => String(d.id || d.id_dispositivo) === String(e.id_dispositivo)) || {};
      return {
        ...e,
        nombre: `Entrega: ${disp.nombre || 'Dispositivo'}`,
        estado: 'Listo para entrega',
        ubicacion: disp.ubicacion,
        tipo: 'Compromiso',
        serial: disp.serial,
        marca: disp.marca,
        modelo: disp.modelo,
        isCustom: true,
        _dispOrig: disp,
      };
    });

    return [...regEvents, ...customEvents];
  };

  const proximosEventos = [
    ...dispositivos.filter(d => d.fecha_registro).map(d => ({ ...d, _fecha: new Date(d.fecha_registro), isRegistro: true })),
    ...eventosCustom.filter(e => e.fecha_estimada).map(e => {
      const disp = dispositivos.find(d => String(d.id || d.id_dispositivo) === String(e.id_dispositivo)) || {};
      const parts = e.fecha_estimada.split('-');
      return {
        ...e,
        _fecha: new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2])),
        nombre: `Entrega: ${disp.nombre || 'Dispositivo'}`,
        estado: 'Listo para entrega',
        ubicacion: disp.ubicacion,
        tipo: 'Compromiso',
        serial: disp.serial,
        marca: disp.marca,
        modelo: disp.modelo,
        isCustom: true,
        _dispOrig: disp,
      };
    })
  ]
    .filter(d => d._fecha >= new Date(year, month, 1) && d._fecha <= new Date(year, month + 1, 0))
    .sort((a, b) => a._fecha - b._fecha)
    .slice(0, 5);

  const colorEvento = (estado) => {
    switch (estado) {
      case 'Disponible':       return { bg: '#dcfce7', color: '#15803d' };
      case 'En Revision':      return { bg: '#f3e8ff', color: '#7e22ce' };
      case 'En Mantenimiento': return { bg: '#ffedd5', color: '#c2410c' };
      case 'Dado de Baja':     return { bg: '#fef2f2', color: '#991b1b' };
      default:                 return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  
  const abrirModalSalida = (ev) => {
    setEventoSalida(ev);
    setMensajeSalida('');
    setModalSalida(true);
  };

  const confirmarSalida = async () => {
    if (!eventoSalida) return;
    setCargandoSalida(true);
    try {
      await registrarSalidaAPI(eventoSalida._dispOrig || eventoSalida);
      setMensajeSalida('Salida registrada correctamente.');
      // Refresca dispositivos desde la BD
      const res = await getDispositivos();
      setDispositivos(res.data);
      setTimeout(() => {
        setModalSalida(false);
        setEventoSalida(null);
        setMensajeSalida('');
      }, 1500);
    } catch (err) {
      setMensajeSalida('Error al registrar la salida. Intenta de nuevo.');
    } finally {
      setCargandoSalida(false);
    }
  };

  // ── Manejadores de detalle equipo ──────────────────────────────────────────
  const abrirDetalle = (ev) => {
    const disp = ev._dispOrig || dispositivos.find(d =>
      String(d.id || d.id_dispositivo) === String(ev.id || ev.id_dispositivo)
    ) || ev;
    setEquipoDetalle(disp);
    setModalDetalle(true);
  };

  const celdas = [];
  for (let i = primerDia - 1; i >= 0; i--) {
    celdas.push({ dia: diasEnMesAnterior - i, actual: false });
  }
  for (let i = 1; i <= diasEnMes; i++) {
    celdas.push({ dia: i, actual: true });
  }
  const restantes = 42 - celdas.length;
  for (let i = 1; i <= restantes; i++) {
    celdas.push({ dia: i, actual: false });
  }

  const s = {
    wrap: { padding: '1.5rem', fontFamily: 'system-ui, sans-serif' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    navWrap: { display: 'flex', alignItems: 'center', gap: '.75rem' },
    navBtn: { width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', color: 'var(--text-main)' },
    mesLabel: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 270px', gap: '1rem', alignItems: 'start' },
    calCard: { background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' },
    calHeader: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'preset', backgroundColor: 'var(--table-head)', borderBottom: '1px solid var(--border)' },
    dow: { padding: '.5rem 0', textAlign: 'center', fontSize: '.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' },
    calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' },
    sideCard: { background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1rem' },
    sideTitle: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.83rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '.75rem' },
    sideDot: { width: '4px', height: '14px', background: 'linear-gradient(135deg,#0492C2,#82EEFD)', borderRadius: '2px' },
    // Botón salida pequeño
    btnSalida: {
      fontSize: '.6rem', fontWeight: 700, padding: '3px 8px',
      borderRadius: '20px', border: 'none', cursor: 'pointer',
      background: 'linear-gradient(135deg,#ef4444,#f87171)',
      color: '#fff', whiteSpace: 'nowrap', marginTop: '4px',
      transition: 'opacity .15s',
    },
    // Nombre equipo clickeable
    linkNombre: {
      fontSize: '.76rem', fontWeight: 600, color: 'var(--primary)',
      cursor: 'pointer', textDecoration: 'underline dotted',
    },
    // Overlay modal
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalBox: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', width: '420px', maxWidth: '92%', padding: '1.75rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45)' },
  };

  return (
    <div style={s.wrap}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
        Calendario
      </h1>

      <div style={s.topRow}>
        <div style={s.navWrap}>
          <button style={s.navBtn} onClick={mesAnterior}>‹</button>
          <span style={s.mesLabel}>{nombresMes[month]} {year}</span>
          <button style={s.navBtn} onClick={mesSiguiente}>›</button>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          style={{ background: 'linear-gradient(135deg, #0492C2, #82EEFD)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          + Agregar evento
        </button>
      </div>

      <div style={s.layout}>

        {/* ── Grilla del calendario ── */}
        <div style={s.calCard}>
          <div style={s.calHeader}>
            {diasSemana.map(d => (
              <div key={d} style={s.dow}>{d}</div>
            ))}
          </div>
          <div style={s.calGrid}>
            {celdas.map((celda, idx) => {
              const eventos = celda.actual ? eventosDia(celda.dia) : [];
              const today = celda.actual && esHoy(celda.dia);
              const seleccionado = diaSeleccionado === celda.dia && celda.actual;

              return (
                <div
                  key={idx}
                  onClick={() => celda.actual && setDiaSeleccionado(celda.dia === diaSeleccionado ? null : celda.dia)}
                  style={{
                    minHeight: '80px', padding: '.4rem .5rem',
                    borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                    cursor: celda.actual ? 'pointer' : 'default',
                    background: seleccionado ? 'var(--hover)' : today ? 'var(--input-bg)' : celda.actual ? 'transparent' : 'var(--bg-main)',
                    transition: 'background .15s'
                  }}
                >
                  <div style={{
                    fontSize: '.74rem', fontWeight: today ? 800 : 600,
                    color: today ? 'var(--primary)' : celda.actual ? 'var(--text-main)' : 'var(--text-muted)',
                    marginBottom: '.3rem', width: '22px', height: '22px', borderRadius: '50%',
                    background: today ? 'var(--hover)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {celda.dia}
                  </div>
                  {eventos.slice(0, 2).map((ev, i) => {
                    const col = colorEvento(ev.estado);
                    return (
                      <div key={i} style={{
                        fontSize: '.62rem', fontWeight: 600, padding: '2px 5px', borderRadius: '4px',
                        marginBottom: '2px', background: col.bg, color: col.color,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {ev.nombre}
                      </div>
                    );
                  })}
                  {eventos.length > 2 && (
                    <div style={{ fontSize: '.6rem', color: '#94a3b8', fontWeight: 600 }}>
                      +{eventos.length - 2} más
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

     
        <div>

          {/* Día seleccionado */}
          {diaSeleccionado && (
            <div style={s.sideCard}>
              <div style={s.sideTitle}>
                <div style={s.sideDot}></div>
                {diaSeleccionado} de {nombresMes[month]}
              </div>
              {eventosDia(diaSeleccionado).length === 0 ? (
                <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '.5rem 0' }}>
                  Sin eventos este día
                </p>
              ) : (
                eventosDia(diaSeleccionado).map((ev, i) => {
                  const col = colorEvento(ev.estado);
                  const lista = eventosDia(diaSeleccionado);
                  return (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '.65rem', marginBottom: '.65rem', borderBottom: i < lista.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color, flexShrink: 0, marginTop: '5px' }}></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Nombre clickeable → detalle */}
                        <div
                          style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline dotted' }}
                          onClick={() => abrirDetalle(ev)}
                          title="Ver detalles del equipo"
                        >
                          {ev.nombre}
                        </div>
                        <div style={{ fontSize: '.69rem', color: 'var(--text-muted)', marginTop: '1px' }}>{ev.tipo} · {ev.ubicacion || 'Sin ubicación'}</div>

                        {/* Serial y Marca */}
                        <div style={{ fontSize: '.64rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {ev.marca  && <span style={{ marginRight: '6px' }}>marca: {ev.marca}</span>}
                          {ev.serial && <span> serial: {ev.serial}</span>}
                        </div>

                        {ev.isCustom && ev.nota && (
                          <div style={{ fontSize: '.68rem', color: 'var(--primary)', marginTop: '3px', fontStyle: 'italic' }}>
                            Nota: {ev.nota}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '5px' }}>
                          <span style={{ display: 'inline-block', fontSize: '.62rem', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: col.bg, color: col.color }}>
                            {ev.estado}
                          </span>
                          {/* Botón registrar salida */}
                          <button
                            style={s.btnSalida}
                            onClick={() => abrirModalSalida(ev)}
                            title="Registrar salida de este equipo"
                          >
                            ↩ Registrar salida
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Eventos del mes ── */}
          <div style={s.sideCard}>
            <div style={s.sideTitle}>
              <div style={s.sideDot}></div>
              Eventos del mes
            </div>
            {proximosEventos.length === 0 ? (
              <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '.5rem 0' }}>
                Sin eventos este mes
              </p>
            ) : (
              proximosEventos.map((ev, i) => {
                const col = colorEvento(ev.estado);
                return (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '.65rem', marginBottom: '.65rem', borderBottom: i < proximosEventos.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: col.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '.85rem', fontWeight: 800, color: col.color, lineHeight: 1 }}>
                        {ev._fecha.getDate()}
                      </div>
                      <div style={{ fontSize: '.52rem', color: col.color, fontWeight: 600, textTransform: 'uppercase' }}>
                        {nombresMes[ev._fecha.getMonth()].slice(0, 3)}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.76rem', fontWeight: 600, color: 'var(--text-main)' }}>{ev.nombre}</div>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>{ev.ubicacion || 'Sin ubicación'}</div>
                      <span style={{ display: 'inline-block', fontSize: '.6rem', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: col.bg, color: col.color, marginTop: '3px' }}>
                        {ev.estado}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Leyenda */}
          <div style={s.sideCard}>
            <div style={s.sideTitle}>
              <div style={s.sideDot}></div>
              Leyenda
            </div>
            {[
              { label: 'Listo para entrega', bg: '#ffedd5', color: '#dacd1c' },
              { label: 'En Revisión',        bg: '#f3e8ff', color: '#7e22ce' },
              { label: 'En mantenimiento',   bg: '#dcfce7', color: '#c2410c' },
              { label: 'Entregado',          bg: '#fef2f2', color: '#15803d' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.74rem', color: 'var(--text-muted)', marginBottom: '.4rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.bg, border: `1px solid ${item.color}`, flexShrink: 0 }}></div>
                {item.label}
              </div>
            ))}
          </div>

        </div>
      </div>


      {modalAbierto && (
        <div style={s.overlay}>
          <div style={s.modalBox}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Agregar fecha comprometida</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Indica cuándo estará listo este dispositivo</p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>Dispositivo</label>
              <select
                value={nuevoEvento.id_dispositivo}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, id_dispositivo: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              >
                <option value="">Selecciona un equipo...</option>
                {dispositivos.map(d => (
                  <option key={d.id || d.id_dispositivo} value={d.id || d.id_dispositivo}>
                    {d.nombre} — {d.marca || 'Sin marca'} — Serial: {d.serial || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>Fecha estimada de entrega</label>
              <input
                type="date"
                value={nuevoEvento.fecha_estimada}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha_estimada: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>Nota para el técnico (opcional)</label>
              <textarea
                rows="3"
                placeholder="Ej: esperando repuesto, cliente llama el viernes..."
                value={nuevoEvento.nota}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, nota: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.85rem', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ flex: 1, padding: '0.7rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!nuevoEvento.id_dispositivo || !nuevoEvento.fecha_estimada) return;
                  const newEv = { ...nuevoEvento, id_evento: Date.now().toString() };
                  const updated = [...eventosCustom, newEv];
                  setEventosCustom(updated);
                  localStorage.setItem('eventosCustom', JSON.stringify(updated));
                  setModalAbierto(false);
                  setNuevoEvento({ id_dispositivo: '', fecha_estimada: '', nota: '' });
                }}
                style={{ flex: 1, padding: '0.7rem', background: 'linear-gradient(135deg,#0492C2,#82EEFD)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Guardar fecha ↗
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Solo disponible para equipos en estado "En revisión" o "En mantenimiento"
            </p>
          </div>
        </div>
      )}

      {modalSalida && eventoSalida && (
        <div style={s.overlay}>
          <div style={{ ...s.modalBox, width: '380px' }}>
            {/* Icono */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#fef2f2,#fee2e2)', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto' }}>
                ↩
              </div>
            </div>

            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', textAlign: 'center', marginBottom: '.3rem' }}>
              Registrar Salida
            </h2>
            <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.25rem' }}>
              ¿Confirmas la salida de este equipo?
            </p>

            {/* Tarjeta resumen equipo */}
            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '.5rem' }}>
                {eventoSalida.nombre}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.3rem .75rem' }}>
                {[
                  { label: 'Marca',     value: eventoSalida.marca   || '—' },
                  { label: 'Serial',    value: eventoSalida.serial   || '—' },
                  { label: 'Modelo',    value: eventoSalida.modelo   || '—' },
                  { label: 'Ubicación', value: eventoSalida.ubicacion || '—' },
                  { label: 'Estado',    value: eventoSalida.estado   || '—' },
                  { label: 'Fecha',     value: eventoSalida._fecha ? eventoSalida._fecha.toLocaleDateString('es') : '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-main)', fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mensaje de resultado */}
            {mensajeSalida && (
              <div style={{ fontSize: '.78rem', textAlign: 'center', marginBottom: '.75rem', color: mensajeSalida.startsWith('✅') ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                {mensajeSalida}
              </div>
            )}

            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button
                onClick={() => { setModalSalida(false); setEventoSalida(null); }}
                disabled={cargandoSalida}
                style={{ flex: 1, padding: '0.65rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '.85rem' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSalida}
                disabled={cargandoSalida}
                style={{ flex: 1, padding: '0.65rem', background: cargandoSalida ? '#94a3b8' : 'linear-gradient(135deg,#ef4444,#f87171)', border: 'none', color: '#fff', borderRadius: '8px', cursor: cargandoSalida ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '.85rem' }}
              >
                {cargandoSalida ? 'Guardando…' : '✓ Confirmar salida'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalDetalle && equipoDetalle && (
        <div style={s.overlay}>
          <div style={{ ...s.modalBox, width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '.15rem' }}>
                  Detalle del equipo
                </h2>
                <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Información completa desde la base de datos</p>
              </div>
              <button
                onClick={() => { setModalDetalle(false); setEquipoDetalle(null); }}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Nombre del equipo */}
            <div style={{ background: 'linear-gradient(135deg,#0492C220,#82EEFD20)', border: '1px solid #0492C240', borderRadius: '10px', padding: '.75rem 1rem', marginBottom: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {equipoDetalle.nombre || '—'}
              </div>
              <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {equipoDetalle.tipo || 'Equipo'}
              </div>
            </div>

            
            {equipoDetalle.descripcion && (
              <div style={{ background: 'var(--input-bg)', borderRadius: '8px', padding: '.65rem .8rem', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>📝 Descripción</div>
                <div style={{ fontSize: '.76rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{equipoDetalle.descripcion}</div>
              </div>
            )}

            <button
              onClick={() => { setModalDetalle(false); setEquipoDetalle(null); }}
              style={{ width: '100%', padding: '0.65rem', background: 'linear-gradient(135deg,#0492C2,#82EEFD)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '.85rem' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Calendario;