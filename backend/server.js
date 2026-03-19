const express = require('express');
const cors = require('cors');
const path = require("path");
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));
// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DeviceGuard API' });
});

// Import Routes
const usuariosRoutes = require('./src/routes/usuarios.routes');
const dispositivosRoutes = require('./src/routes/dispositivos.routes');
const prestamosRoutes = require('./src/routes/prestamos.routes');
const mantenimientoRoutes = require('./src/routes/mantenimiento.routes');

// Use Routes
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/mantenimiento', mantenimientoRoutes);

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'El archivo supera los 5 MB permitidos.' });
  }
  return res.status(400).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
