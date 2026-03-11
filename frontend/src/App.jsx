import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Dispositivos from './pages/Dispositivos';
import Prestamos from './pages/Prestamos';
import Mantenimiento from './pages/Mantenimiento';
import Usuarios from './pages/Usuarios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [usuario, setUsuario] = React.useState(null);

  // Verificar si hay una sesión guardada al cargar la app
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

  // Componente para rutas protegidas
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return (
      <div className="app-container">
        <Sidebar onLogout={handleLogout} usuario={usuario} />
        <div className="main-content">
          <Navbar />
          <div className="page-container">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Ruta pública - Landing Page */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Login onLogin={handleLogin} />
        } />

        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dispositivos" element={
          <ProtectedRoute>
            <Dispositivos />
          </ProtectedRoute>
        } />
        
        <Route path="/prestamos" element={
          <ProtectedRoute>
            <Prestamos />
          </ProtectedRoute>
        } />
        
        <Route path="/mantenimiento" element={
          <ProtectedRoute>
            <Mantenimiento />
          </ProtectedRoute>
        } />
        
        <Route path="/usuarios" element={
          <ProtectedRoute>
            <Usuarios />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
