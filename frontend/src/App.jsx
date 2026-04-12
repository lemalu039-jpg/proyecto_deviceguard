import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Dispositivos from './pages/Dispositivos';
import Registrarsalida from './pages/Registrarsalida';
import Prestamos from './pages/Prestamos';
import Mantenimiento from './pages/Mantenimiento';
import Usuarios from './pages/Usuarios';
import CambiarCorreo from './pages/CambiarCorreo';
import CambiarContrasena from './pages/CambiarContrasena';
import Reportes from './pages/Reportes';
import Estadisticas from './pages/Estadisticas';
import ConsultarFiltros from './pages/Consultarfiltros';
import Correo from './pages/Correo';
import GestionMantenimiento from './pages/GestionMantenimiento';
import Equipo from './pages/Equipo';
import Calendario from './pages/Calendario';
import HistorialDispositivo from './pages/HistorialDispositivo';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [usuario, setUsuario] = React.useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setUsuario(usuarioData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('usuario');
      }
    }
  }, []);

  const handleLogin = (usuarioData) => {
    setUsuario(usuarioData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return (
      <div className="app-container">
        <Sidebar onLogout={handleLogout} usuario={usuario} />
        <div className="main-content">
          <Navbar onLogout={handleLogout} />
          <div className="page-container">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            isAuthenticated ?
              <Navigate to="/dashboard" /> :
              <Login onLogin={handleLogin} />
          } />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dispositivos" element={<ProtectedRoute><Dispositivos /></ProtectedRoute>} />
          <Route path="/Registrarsalida" element={<ProtectedRoute><Registrarsalida /></ProtectedRoute>} />
          <Route path="/prestamos" element={<ProtectedRoute><Prestamos /></ProtectedRoute>} />
          <Route path="/mantenimiento" element={<ProtectedRoute><Mantenimiento /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          <Route path="/cambiar-correo" element={<ProtectedRoute><CambiarCorreo /></ProtectedRoute>} />
          <Route path="/cambiar-contrasena" element={<ProtectedRoute><CambiarContrasena /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
          <Route path="/consultarfiltros" element={<ProtectedRoute><ConsultarFiltros /></ProtectedRoute>} />
          <Route path="/correo" element={<ProtectedRoute><Correo /></ProtectedRoute>} />
          <Route path="/estadisticas" element={<ProtectedRoute><Estadisticas /></ProtectedRoute>} />
          <Route path="/gestion" element={<ProtectedRoute><GestionMantenimiento /></ProtectedRoute>} />
          <Route path="/equipo" element={<ProtectedRoute><Equipo /></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
          <Route path="/historial/:id" element={<ProtectedRoute><HistorialDispositivo /></ProtectedRoute>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
