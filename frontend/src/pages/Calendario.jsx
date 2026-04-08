import React, { useEffect, useState } from 'react';
import { getDispositivos } from '../services/api';

function Calendario() {
  const [dispositivos, setDispositivos] = useState([]);
  const [fecha, setFecha] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({ id_dispositivo: '', fecha_estimada: '', nota: '' });

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
          isCustom: true
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
          isCustom: true
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
          style={{ background: 'var(--primary)',  background: 'linear-gradient(135deg, #0492C2, #82EEFD)',  color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          + Agregar evento
        </button>
      </div>

      <div style={s.layout}>

       
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
                    minHeight: '80px',
                    padding: '.4rem .5rem',
                    borderRight: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    cursor: celda.actual ? 'pointer' : 'default',
                    background: seleccionado ? 'var(--hover)' : today ? 'var(--input-bg)' : celda.actual ? 'transparent' : 'var(--bg-main)',
                    transition: 'background .15s'
                  }}
                >
                  <div style={{
                    fontSize: '.74rem',
                    fontWeight: today ? 800 : 600,
                    color: today ? 'var(--primary)' : celda.actual ? 'var(--text-main)' : 'var(--text-muted)',
                    marginBottom: '.3rem',
                    width: '22px', height: '22px',
                    borderRadius: '50%',
                    background: today ? 'var(--hover)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {celda.dia}
                  </div>
                  {eventos.slice(0, 2).map((ev, i) => {
                    const col = colorEvento(ev.estado);
                    return (
                      <div key={i} style={{
                        fontSize: '.62rem', fontWeight: 600,
                        padding: '2px 5px', borderRadius: '4px',
                        marginBottom: '2px',
                        background: col.bg, color: col.color,
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
                  return (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '.65rem', marginBottom: '.65rem', borderBottom: i < eventosDia(diaSeleccionado).length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color, flexShrink: 0, marginTop: '5px' }}></div>
                      <div>
                        <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-main)' }}>{ev.nombre}</div>
                        <div style={{ fontSize: '.69rem', color: 'var(--text-muted)', marginTop: '1px' }}>{ev.tipo} · {ev.ubicacion || 'Sin ubicación'}</div>
                        {ev.isCustom && ev.nota && (
                            <div style={{ fontSize: '.68rem', color: 'var(--primary)', marginTop: '3px', fontStyle: 'italic' }}>
                                Nota: {ev.nota}
                            </div>
                        )}
                        <span style={{ display: 'inline-block', fontSize: '.62rem', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: col.bg, color: col.color, marginTop: '5px' }}>
                          {ev.estado}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

         
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

          
          <div style={s.sideCard}>
            <div style={s.sideTitle}>
              <div style={s.sideDot}></div>
              Leyenda
            </div>
            {[
              { label: 'Listo para entrega', bg: '#ffedd5', color: '#dacd1c' },
              { label: 'En Revisión',      bg: '#f3e8ff', color: '#7e22ce' },
              { label: 'En mantenimiento',       bg: '#dcfce7', color: '#c2410c' },
              { label: 'Entregado',     bg: '#fef2f2', color: '#15803d' },
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', width: '400px', maxWidth: '90%', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Agregar fecha comprometida</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Indica cuándo estará listo este dispositivo</p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>Dispositivo</label>
              <select 
                value={nuevoEvento.id_dispositivo} 
                onChange={(e) => setNuevoEvento({...nuevoEvento, id_dispositivo: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              >
                <option value="">Selecciona un equipo...</option>
                {dispositivos.map(d => (
                  <option key={d.id || d.id_dispositivo} value={d.id || d.id_dispositivo}>{d.nombre} — Serial {d.serial}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>Fecha estimada de entrega</label>
              <input 
                type="date" 
                value={nuevoEvento.fecha_estimada}
                onChange={(e) => setNuevoEvento({...nuevoEvento, fecha_estimada: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>Nota para el técnico (opcional)</label>
              <textarea 
                rows="3"
                placeholder="Ej: esperando repuesto, cliente llama el viernes..."
                value={nuevoEvento.nota}
                onChange={(e) => setNuevoEvento({...nuevoEvento, nota: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.85rem', resize: 'none' }}
              ></textarea>
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
                  const newEv = {
                    ...nuevoEvento,
                    id_evento: Date.now().toString()
                  };
                  const updated = [...eventosCustom, newEv];
                  setEventosCustom(updated);
                  localStorage.setItem('eventosCustom', JSON.stringify(updated));
                  setModalAbierto(false);
                  setNuevoEvento({ id_dispositivo: '', fecha_estimada: '', nota: '' });
                }}
                style={{ flex: 1, padding: '0.7rem', background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
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
    </div>
  );
}

export default Calendario;
