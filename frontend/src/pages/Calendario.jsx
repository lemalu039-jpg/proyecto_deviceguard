import React, { useEffect, useState } from 'react';
import { getDispositivos, updateDispositivo, deleteDispositivo } from '../services/api';
import './css/Calendario_responsive.css';
import { useLanguage } from '../context/LanguageContext.jsx';

function Calendario() {
  const { t } = useLanguage();
  const [dispositivos, setDispositivos] = useState([]);
  const [fecha, setFecha] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({ id_dispositivo: '', fecha_estimada: '', nota: '' });

  const [modalDetalle, setModalDetalle] = useState(false);
  const [equipoDetalle, setEquipoDetalle] = useState(null);
  const [modalSalida, setModalSalida] = useState(false);
  const [eventoSalida, setEventoSalida] = useState(null);
  const [cargandoSalida, setCargandoSalida] = useState(false);
  const [mensajeSalida, setMensajeSalida] = useState('');

  const [paginaDia, setPaginaDia] = useState(0);
  const ITEMS_PIA = 5; // eventos por página en el sidebar del día

  // Reset página al cambiar día seleccionado
  useEffect(() => { setPaginaDia(0); }, [diaSeleccionado]);

  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
  const esUsuario = usuarioActual.rol === 'usuario';
  const storageKey = `eventosCustom_${usuarioActual.id || 'guest'}`;

  const [eventosCustom, setEventosCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    getDispositivos().then(res => {
      const todos = res.data;
      const filtrados = esUsuario
        ? todos.filter(d => d.usuario_id === usuarioActual.id)
        : todos;
      setDispositivos(filtrados);
    }).catch(console.error);
  }, []);

  const year = fecha.getFullYear();
  const month = fecha.getMonth();

  const nombresMes = [t('ene'), t('feb'), t('mar'), t('abr'), t('may'), t('jun'), t('jul'), t('ago'), t('sep'), t('oct'), t('nov'), t('dic')];
  const diasSemana = [t('dom'), t('lun'), t('mar_dia'), t('mie'), t('jue'), t('vie'), t('sab')];

  const primerDia = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const diasEnMesAnterior = new Date(year, month, 0).getDate();

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
      return parts.length === 3 &&
        parseInt(parts[2]) === dia &&
        (parseInt(parts[1]) - 1) === month &&
        parseInt(parts[0]) === year;
    }).map(e => {
      const disp = dispositivos.find(d => String(d.id) === String(e.id_dispositivo)) || {};
      return {
        ...e,
        nombre: `${t('cal_entrega')} ${disp.nombre || t('cal_dispositivo_label')}`,
        estado: e.estado || disp.estado || t('dash_listo_entrega'),
        ubicacion: disp.ubicacion,
        tipo: t('cal_compromiso') || 'Compromiso',
        serial: disp.serial,
        marca: disp.marca,
        descripcion: disp.descripcion,
        isCustom: true,
        _dispOrig: disp,
      };
    });

    return [...regEvents, ...customEvents];
  };

  const proximosEventos = [
    ...dispositivos.filter(d => d.fecha_registro).map(d => ({
      ...d, _fecha: new Date(d.fecha_registro), isRegistro: true
    })),
    ...eventosCustom.filter(e => e.fecha_estimada).map(e => {
      const disp = dispositivos.find(d => String(d.id) === String(e.id_dispositivo)) || {};
      const parts = e.fecha_estimada.split('-');
      return {
        ...e,
        _fecha: new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2])),
        nombre: `${t('cal_entrega')} ${disp.nombre || t('cal_dispositivo_label')}`,
        estado: e.estado || t('dash_listo_entrega'),
        ubicacion: disp.ubicacion,
        tipo: t('cal_compromiso') || 'Compromiso',
        serial: disp.serial,
        marca: disp.marca,
        descripcion: disp.descripcion,
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
      case 'Disponible':        return { bg: '#dcfce7', color: '#15803d' };
      case 'En Revision':       return { bg: '#f3e8ff', color: '#7e22ce' };
      case 'En Mantenimiento':  return { bg: '#ffedd5', color: '#c2410c' };
      case 'Dado de Baja':      return { bg: '#fef2f2', color: '#991b1b' };
      case 'Listo para entrega':return { bg: '#fefce8', color: '#854d0e' };
      default:                  return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const abrirModalSalida = (ev) => {
    setEventoSalida(ev);
    setMensajeSalida('');
    setModalSalida(true);
  };

  const obtenerTextoAccion = (estado) => {
    const est = (estado || '').trim().toLowerCase();
    if (est === 'listo para entrega' || est === 'listo_para_entrega') {
      return { boton: t('cal_registrar_entrega'), modal: t('cal_modal_registrar_entrega'), nuevoEstado: 'Entregado' };
    }
    if (est === 'en revision' || est === 'en_revision' || est === 'revision') {
      return { boton: t('cal_registrar_mantenimiento'), modal: t('cal_modal_registrar_mantenimiento'), nuevoEstado: 'En Mantenimiento' };
    }
    if (est === 'en mantenimiento' || est === 'en_mantenimiento' || est === 'mantenimiento') {
      return { boton: t('cal_registrar_salida'), modal: t('cal_modal_registrar_salida'), nuevoEstado: 'Listo para entrega' };
    }
    return { boton: t('cal_registrar_salida'), modal: t('cal_modal_registrar_salida'), nuevoEstado: 'Entregado' };
  };

  const confirmarSalida = async () => {
    if (!eventoSalida) return;
    setCargandoSalida(true);
    try {
      const ahora = new Date();
      const id = eventoSalida._dispOrig?.id || eventoSalida.id || eventoSalida.id_dispositivo;
      const accion = obtenerTextoAccion(eventoSalida.estado);

      // Solo guardar fecha_salida cuando el nuevo estado es "Listo para entrega" o "Entregado"
      const esSalida = accion.nuevoEstado === 'Listo para entrega' || accion.nuevoEstado === 'Entregado';
      await updateDispositivo(id, {
        estado: accion.nuevoEstado,
        fecha_salida: esSalida ? ahora.toISOString().split('T')[0] : null,
        hora_salida: esSalida ? ahora.toTimeString().slice(0, 5) : null,
      });
      setMensajeSalida(t('cal_accion_registrada'));
      const res = await getDispositivos();
      setDispositivos(res.data);

      if (eventoSalida.isCustom && eventoSalida.id_evento) {
        const eventosActualizados = eventosCustom.map(e =>
          e.id_evento === eventoSalida.id_evento
            ? { ...e, estado: accion.nuevoEstado }
            : e
        );
        setEventosCustom(eventosActualizados);
        localStorage.setItem(storageKey, JSON.stringify(eventosActualizados));
      }

      setModalSalida(false);
      setEventoSalida(null);
      setMensajeSalida('');
    } catch (error) {
      console.error('Error al registrar acción:', error);
      setMensajeSalida(t('cal_err_registrar_accion'));
    } finally {
      setCargandoSalida(false);
    }
  };

  const abrirDetalle = (ev) => {
    const disp = ev._dispOrig ||
      dispositivos.find(d => String(d.id) === String(ev.id || ev.id_dispositivo)) ||
      ev;
    setEquipoDetalle(disp);
    setModalDetalle(true);
  };

  // ── Celdas: solo las necesarias (35 o 42) ──
  const celdas = [];
  for (let i = primerDia - 1; i >= 0; i--) celdas.push({ dia: diasEnMesAnterior - i, actual: false });
  for (let i = 1; i <= diasEnMes; i++) celdas.push({ dia: i, actual: true });
  const totalFilas = celdas.length <= 35 ? 35 : 42;
  const restantes = totalFilas - celdas.length;
  for (let i = 1; i <= restantes; i++) celdas.push({ dia: i, actual: false });
  const numFilas = totalFilas / 7;

  const s = {
    wrap: { padding: '1rem 1rem 0 1rem', fontFamily: 'system-ui, sans-serif' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    navWrap: { display: 'flex', alignItems: 'center', gap: '.75rem' },
    navBtn: { width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', color: 'var(--text-main)' },
    mesLabel: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', minWidth: '180px', textAlign: 'center' },
    layout: { display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' },
    calCard: { background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' },
    calHeader: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'var(--table-head)', borderBottom: '1px solid var(--border)' },
    dow: { padding: '.5rem 0', textAlign: 'center', fontSize: '.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' },
    // ── CLAVE: filas fijas según el mes ──
    calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gridTemplateRows: `repeat(${numFilas}, 70px)` },
    sideCard: { background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1rem' },
    sideTitle: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.83rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '.75rem' },
    sideDot: { width: '4px', height: '14px', background: 'linear-gradient(135deg,#0492C2,#82EEFD)', borderRadius: '2px' },
    btnSalida: { fontSize: '.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#ef4444,#f87171)', color: '#fff', marginTop: '4px' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalBox: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', width: '420px', maxWidth: '92%', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', overflow: 'hidden' },
    modalHeader: { background: 'linear-gradient(135deg,#151E3D,#0492C2)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalBody: { padding: '1.5rem' },
  };

  return (
    <div style={s.wrap}>
      <h1 className="page-title">{t('cal_titulo')}</h1>

      <div style={s.topRow}>
        <div style={s.navWrap}>
          <button style={s.navBtn} onClick={() => setFecha(new Date(year, month - 1, 1))}>‹</button>
          <span style={s.mesLabel}>{nombresMes[month]} {year}</span>
          <button style={s.navBtn} onClick={() => setFecha(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div style={{ display: 'flex', gap: '.6rem' }}>
          <button onClick={() => setFecha(new Date())}
            style={{ background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '.42rem .9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600 }}>
            {t('cal_hoy')}
          </button>
          {!esUsuario && (
            <button onClick={() => setModalAbierto(true)}
              style={{ background: 'linear-gradient(135deg,#0492C2,#82EEFD)', color: '#fff', border: 'none', padding: '.42rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '.78rem' }}>
              {t('cal_agregar_evento')}
            </button>
          )}
        </div>
      </div>

      <div style={s.layout} className="calendario-layout">

        <div style={s.calCard} className="calendario-card">
          <div style={s.calHeader} className="calendario-header-row">
            {diasSemana.map(d => <div key={d} style={s.dow} className="calendario-header">{d}</div>)}
          </div>
          <div className="calendario-grid" style={{ '--num-filas': numFilas }}>
            {celdas.map((celda, idx) => {
              const eventos = celda.actual ? eventosDia(celda.dia) : [];
              const today = celda.actual && esHoy(celda.dia);
              const sel = diaSeleccionado === celda.dia && celda.actual;
              return (
                <div key={idx}
                  onClick={() => celda.actual && setDiaSeleccionado(celda.dia === diaSeleccionado ? null : celda.dia)}
                  className="calendario-day-cell"
                  style={{
                    overflow: 'hidden',
                    padding: '.3rem .4rem',
                    borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                    cursor: celda.actual ? 'pointer' : 'default',
                    background: sel ? 'var(--hover)' : today ? 'rgba(4,146,194,.08)' : celda.actual ? 'transparent' : 'var(--bg-main)',
                    transition: 'background .15s'
                  }}>
                  <div style={{
                    fontSize: '.74rem', fontWeight: today ? 800 : 600,
                    color: today ? '#0492C2' : celda.actual ? 'var(--text-main)' : 'var(--text-muted)',
                    marginBottom: '.3rem', width: '22px', height: '22px', borderRadius: '50%',
                    background: today ? 'rgba(4,146,194,.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {celda.dia}
                  </div>
                  {eventos.slice(0, 2).map((ev, i) => {
                    const col = colorEvento(ev.estado);
                    return (
                      <div key={i} style={{ fontSize: '.62rem', fontWeight: 600, padding: '2px 5px', borderRadius: '4px', marginBottom: '2px', background: col.bg, color: col.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.nombre}
                      </div>
                    );
                  })}
                  {eventos.length > 2 && <div style={{ fontSize: '.6rem', color: '#94a3b8', fontWeight: 600 }}>+{eventos.length - 2} {t('cal_mas')}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="calendario-sidebar">

          {diaSeleccionado && (
            <div style={s.sideCard}>
              <div style={s.sideTitle}>
                <div style={s.sideDot}></div>
                {diaSeleccionado} de {nombresMes[month]}
              </div>
              {eventosDia(diaSeleccionado).length === 0 ? (
                <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>{t('cal_sin_eventos_dia')}</p>
              ) : (() => {
                const lista = eventosDia(diaSeleccionado);
                const totalPaginas = Math.ceil(lista.length / ITEMS_PIA);
                const eventosPagina = lista.slice(paginaDia * ITEMS_PIA, (paginaDia + 1) * ITEMS_PIA);
                return (
                  <>
                    {eventosPagina.map((ev, i) => {
                      const col = colorEvento(ev.estado);
                      return (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '.65rem', marginBottom: '.65rem', borderBottom: i < eventosPagina.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color, flexShrink: 0, marginTop: '5px' }}></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline dotted' }}
                              onClick={() => abrirDetalle(ev)}>
                              {ev.nombre}
                            </div>
                            <div style={{ fontSize: '.69rem', color: 'var(--text-muted)', marginTop: '1px' }}>{ev.tipo} · {ev.ubicacion || 'Sin ubicación'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '5px' }}>
                              <span style={{ fontSize: '.62rem', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: col.bg, color: col.color }}>{ev.estado}</span>
                              {!esUsuario && ev.estado !== 'Entregado' && (
                                <button style={s.btnSalida} onClick={() => abrirModalSalida(ev)}>{obtenerTextoAccion(ev.estado).boton}</button>
                              )}
                              {!esUsuario && ev.estado === 'Entregado' && (
                                <span style={{ fontSize: '.62rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: '#dcfce7', color: '#15803d' }}>{t('dash_entregado')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {totalPaginas > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.5rem', paddingTop: '.5rem', borderTop: '1px solid var(--border)' }}>
                        <button
                          onClick={() => setPaginaDia(p => Math.max(0, p - 1))}
                          disabled={paginaDia === 0}
                          style={{ padding: '3px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '.72rem', cursor: paginaDia === 0 ? 'not-allowed' : 'pointer', opacity: paginaDia === 0 ? 0.4 : 1 }}>
                          ‹ Ant
                        </button>
                        <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>
                          {paginaDia + 1} / {totalPaginas} · {lista.length} eventos
                        </span>
                        <button
                          onClick={() => setPaginaDia(p => Math.min(totalPaginas - 1, p + 1))}
                          disabled={paginaDia >= totalPaginas - 1}
                          style={{ padding: '3px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '.72rem', cursor: paginaDia >= totalPaginas - 1 ? 'not-allowed' : 'pointer', opacity: paginaDia >= totalPaginas - 1 ? 0.4 : 1 }}>
                          Sig ›
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          <div style={s.sideCard}>
            <div style={s.sideTitle}><div style={s.sideDot}></div>{t('cal_eventos_mes')}</div>
            {proximosEventos.length === 0 ? (
              <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>{t('cal_sin_eventos_mes')}</p>
            ) : (
              proximosEventos.map((ev, i) => {
                const col = colorEvento(ev.estado);
                return (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '.65rem', marginBottom: '.65rem', borderBottom: i < proximosEventos.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: col.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '.85rem', fontWeight: 800, color: col.color, lineHeight: 1 }}>{ev._fecha.getDate()}</div>
                      <div style={{ fontSize: '.52rem', color: col.color, fontWeight: 600, textTransform: 'uppercase' }}>{nombresMes[ev._fecha.getMonth()].slice(0, 3)}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '.76rem', fontWeight: 600, color: 'var(--text-main)' }}>{ev.nombre}</div>
                          <div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>{ev.ubicacion || t('cal_sin_ubicacion')}</div>
                        </div>
                        {!esUsuario && (
                          <button style={{ fontSize: '.5rem', padding: '2px 5px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }} onClick={() => eliminarEvento(ev)}>✕</button>
                        )}
                      </div>
                      <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: col.bg, color: col.color, display: 'inline-block', marginTop: '3px' }}>{ev.estado}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>


        </div>
      </div>

      {/* modal agregar evento */}
      {modalAbierto && (
        <div style={s.overlay} onClick={() => setModalAbierto(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '.95rem' }}>{t('cal_modal_agregar_title')}</span>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>{t('cal_dispositivo_label')}</label>
                <select value={nuevoEvento.id_dispositivo}
                  onChange={e => setNuevoEvento({ ...nuevoEvento, id_dispositivo: e.target.value })}
                  style={{ width: '100%', padding: '.55rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--table-head)', color: 'var(--text-main)', fontSize: '.83rem', outline: 'none' }}>
                  <option value="">{t('cal_selecciona_equipo')}</option>
                  {dispositivos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre} — {d.marca || 'Sin marca'} — {d.serial}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>{t('cal_fecha_estimada')}</label>
                <input type="date" value={nuevoEvento.fecha_estimada}
                  onChange={e => setNuevoEvento({ ...nuevoEvento, fecha_estimada: e.target.value })}
                  style={{ width: '100%', padding: '.55rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--table-head)', color: 'var(--text-main)', fontSize: '.83rem', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>{t('cal_nota_opcional')}</label>
                <textarea rows="3" placeholder={t('cal_nota_ph')}
                  value={nuevoEvento.nota}
                  onChange={e => setNuevoEvento({ ...nuevoEvento, nota: e.target.value })}
                  style={{ width: '100%', padding: '.55rem .8rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--table-head)', color: 'var(--text-main)', fontSize: '.83rem', outline: 'none', resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button onClick={() => setModalAbierto(false)}
                  style={{ flex: 1, padding: '.65rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  {t('cancelar')}
                </button>
                <button onClick={() => {
                  if (!nuevoEvento.id_dispositivo || !nuevoEvento.fecha_estimada) return;
                  const updated = [...eventosCustom, { ...nuevoEvento, id_evento: Date.now().toString() }];
                  setEventosCustom(updated);
                  localStorage.setItem(storageKey, JSON.stringify(updated));
                  setModalAbierto(false);
                  setNuevoEvento({ id_dispositivo: '', fecha_estimada: '', nota: '' });
                }}
                  style={{ flex: 1, padding: '.65rem', background: 'linear-gradient(135deg,#0492C2,#82EEFD)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                  {t('cal_guardar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal salida */}
      {modalSalida && eventoSalida && (
        <div style={s.overlay} onClick={() => !cargandoSalida && setModalSalida(false)}>
          <div style={{ ...s.modalBox, width: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '.95rem' }}>{obtenerTextoAccion(eventoSalida.estado).modal}</span>
              <button onClick={() => !cargandoSalida && setModalSalida(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
            <div style={s.modalBody}>
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {t('cal_confirmar_accion')} <strong>{t('dash_' + obtenerTextoAccion(eventoSalida.estado).nuevoEstado.toLowerCase().replace(/ /g, '_')) || obtenerTextoAccion(eventoSalida.estado).nuevoEstado}</strong>.
              </p>
              <div style={{ background: 'var(--table-head)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '.5rem' }}>{eventoSalida.nombre}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.3rem .75rem' }}>
                  {[
                    { label: t('dash_col_marca'),     value: eventoSalida.marca     || '—' },
                    { label: t('dash_col_serial'),    value: eventoSalida.serial    || '—' },
                    { label: t('dash_col_ubicacion'), value: eventoSalida.ubicacion || '—' },
                    { label: t('dash_col_estado'),    value: eventoSalida.estado    || '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-main)', fontWeight: 600 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              {mensajeSalida && (
                <div style={{ fontSize: '.78rem', textAlign: 'center', marginBottom: '.75rem', color: mensajeSalida.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 600 }}>
                  {mensajeSalida}
                </div>
              )}
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button onClick={() => setModalSalida(false)} disabled={cargandoSalida}
                  style={{ flex: 1, padding: '.65rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  {t('cancelar')}
                </button>
                <button onClick={confirmarSalida} disabled={cargandoSalida}
                  style={{ flex: 1, padding: '.65rem', background: cargandoSalida ? '#94a3b8' : 'linear-gradient(135deg,#ef4444,#f87171)', border: 'none', color: '#fff', borderRadius: '8px', cursor: cargandoSalida ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                  {cargandoSalida ? t('cal_guardando') : t('cal_confirmar_btn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal detalle equipo */}
      {modalDetalle && equipoDetalle && (
        <div style={s.overlay} onClick={() => setModalDetalle(false)}>
          <div style={{ ...s.modalBox, width: '420px' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '.95rem' }}>{t('cal_detalle_equipo')}</span>
              <button onClick={() => setModalDetalle(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={{ background: 'rgba(4,146,194,.08)', border: '1px solid rgba(4,146,194,.2)', borderRadius: '10px', padding: '.75rem 1rem', marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{equipoDetalle.nombre || '—'}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{equipoDetalle.tipo || 'Equipo'}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1rem' }}>
                {[
                  { label: t('dash_col_marca'),     value: equipoDetalle.marca     || '—' },
                  { label: t('dash_col_serial'),    value: equipoDetalle.serial    || '—' },
                  { label: t('dash_col_ubicacion'), value: equipoDetalle.ubicacion || '—' },
                  { label: t('dash_col_estado'),    value: equipoDetalle.estado    || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--table-head)', borderRadius: '8px', padding: '.6rem .8rem' }}>
                    <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-main)', fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
              {equipoDetalle.descripcion && (
                <div style={{ background: 'var(--table-head)', border: '1px solid var(--border)', borderRadius: '8px', padding: '.65rem .8rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{t('descripcion')}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{equipoDetalle.descripcion}</div>
                </div>
              )}
              {equipoDetalle.archivo && (
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <img src={`http://localhost:5000/uploads/${equipoDetalle.archivo}`} alt={equipoDetalle.nombre}
                    style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              )}
              <button onClick={() => setModalDetalle(false)}
                style={{ width: '100%', padding: '.65rem', background: 'linear-gradient(135deg,#0492C2,#82EEFD)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                {t('cerrar')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Calendario;