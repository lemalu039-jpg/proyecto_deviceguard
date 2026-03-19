const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DeviceGuard API' });
});


// Import Routes
const usuariosRoutes = require('./src/routes/usuarios.routes');
const dispositivosRoutes = require('./src/routes/dispositivos.routes');
const prestamosRoutes = require('./src/routes/prestamos.routes');
const mantenimientoRoutes = require('./src/routes/mantenimiento.routes');
const reportesRoutes = require('./src/routes/reportes.routes.js');


// Use Routes
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/mantenimiento', mantenimientoRoutes);
app.use('/api/reportes', reportesRoutes);


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
