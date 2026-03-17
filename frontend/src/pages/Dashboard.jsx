import React, { useEffect, useState } from 'react';
import { getDispositivos, getUsuarios } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalDispositivos: 0,
    enUso: 0,
    enMantenimiento: 0,
    fichasSoporte: 15,
    usuarios: 0
  });

  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, usuariosRes] = await Promise.all([
          getDispositivos(),
          getUsuarios()
        ]);

        const allDevices = devicesRes.data;
        const totalDispositivos = allDevices.length;
        const enUso = allDevices.filter(d => d.estado === 'En Prestamo').length;
        const enMantenimiento = allDevices.filter(d => d.estado === 'En Mantenimiento').length;
        
        setStats(prev => ({
          ...prev,
          totalDispositivos,
          enUso,
          enMantenimiento,
          usuarios: usuariosRes.data.length
        }));

        setDispositivos(allDevices.slice(0, 5)); // Just show top 5 in dashboard

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Disponible': return <span className="badge badge-success" style={{padding: '0.4rem 1rem'}}>Activo</span>;
      case 'En Prestamo': return <span className="badge badge-info" style={{padding: '0.4rem 1rem'}}>Devuelto</span>;
      case 'En Mantenimiento': return <span className="badge badge-danger" style={{padding: '0.4rem 1rem'}}>En Reparación</span>;
      default: return <span className="badge badge-secondary" style={{padding: '0.4rem 1rem'}}>{estado}</span>;
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.6rem', color: 'var(--text-main)' }}>Dashboard</h1>

      {loading ? (
        <p>Cargando información...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          <div className="card-light" style={{ position: 'relative', overflow: 'hidden' }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Dispositivos en Uso</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{stats.enUso}</h2>
             
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0, marginTop: '1rem', color: '#10b981', fontWeight: 600 }}>↗ 8.5% <span style={{color: 'var(--text-muted)', fontWeight: 400}}>Mas que ayer</span></p>
          </div>

          <div className="card-light" style={{ position: 'relative', overflow: 'hidden' }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Equipos</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{stats.totalDispositivos}</h2>
              
            </div>
             <p style={{ fontSize: '0.8rem', margin: 0, marginTop: '1rem', color: '#10b981', fontWeight: 600 }}>↗ 1.3% <span style={{color: 'var(--text-muted)', fontWeight: 400}}>Mas que el año Pasado</span></p>
          </div>

          <div className="card-light" style={{ position: 'relative', overflow: 'hidden' }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>En Mantenimiento</p>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{stats.enMantenimiento}</h2>
             
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0, marginTop: '1rem', color: '#ef4444', fontWeight: 600 }}>↙ 4.3% <span style={{color: 'var(--text-muted)', fontWeight: 400}}>Mas que la semana Pasada</span></p>
          </div>

          <div className="card-light" style={{ position: 'relative', overflow: 'hidden' }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fichas de Soporte</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>15</h2>
             
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0, marginTop: '1rem', color: '#10b981', fontWeight: 600 }}>↗ 1.8% <span style={{color: 'var(--text-muted)', fontWeight: 400}}>Mas que la semana pasada</span></p>
          </div>

        </div>
      )}

      {/* Tabla Dashboard */}
      <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Lista Dispositivos</h3>
      <div className="card-light" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr style={{ background: 'white' }}>
                <th style={{ background: 'white', color: 'var(--text-main)', fontWeight: 600, borderBottom: '2px solid #f1f5f9' }}>Imagen</th>
                <th style={{ background: 'white', color: 'var(--text-main)', fontWeight: 600, borderBottom: '2px solid #f1f5f9' }}>Nombre</th>
                <th style={{ background: 'white', color: 'var(--text-main)', fontWeight: 600, borderBottom: '2px solid #f1f5f9' }}>Ubicación</th>
                <th style={{ background: 'white', color: 'var(--text-main)', fontWeight: 600, borderBottom: '2px solid #f1f5f9' }}>Fecha - Hora Entrada</th>
                <th style={{ background: 'white', color: 'var(--text-main)', fontWeight: 600, borderBottom: '2px solid #f1f5f9' }}>Serial</th>
                <th style={{ background: 'white', color: 'var(--text-main)', fontWeight: 600, borderBottom: '2px solid #f1f5f9' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {dispositivos.map((d, i) => (
                <tr key={d.id} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ width: '60px' }}>
                    
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{d.nombre}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.ubicacion || 'Ambiente 4110'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>25- SEP - 2025 6:29</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.serial}</td>
                  <td>{getStatusBadge(d.estado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
