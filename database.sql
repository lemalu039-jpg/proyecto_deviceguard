-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS device_guard_db;
USE device_guard_db;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'usuario') DEFAULT 'usuario',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Dispositivos
CREATE TABLE IF NOT EXISTS dispositivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    serial VARCHAR(100) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50),
    estado ENUM('Disponible', 'En Prestamo', 'En Mantenimiento', 'Inactivo') DEFAULT 'Disponible',
    ubicacion VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Préstamos
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    dispositivo_id INT NOT NULL,
    fecha_prestamo DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion DATETIME,
    estado_prestamo ENUM('Activo', 'Devuelto', 'Atrasado') DEFAULT 'Activo',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE
);

-- Tabla de Mantenimiento
CREATE TABLE IF NOT EXISTS mantenimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispositivo_id INT NOT NULL,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME,
    descripcion TEXT NOT NULL,
    costo DECIMAL(10, 2) DEFAULT 0.00,
    estado_mantenimiento ENUM('En Proceso', 'Completado', 'Cancelado') DEFAULT 'En Proceso',
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE
);

-- INSERCIÓN DE DATOS DE PRUEBA (SEED)

-- Usuarios
INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Juan Pérez', 'juan.perez@sena.edu.co', '123456', 'admin'),
('Maria Lopez', 'maria.lopez@sena.edu.co', '123456', 'usuario'),
('Carlos Ruiz', 'carlos.ruiz@sena.edu.co', '123456', 'usuario');

-- Dispositivos
INSERT INTO dispositivos (nombre, tipo, serial, marca, modelo, estado, ubicacion) VALUES
('Laptop Dell', 'Computadora', 'SN-LT-001', 'Dell', 'XPS 15', 'Disponible', 'Laboratorio 1'),
('Proyector Epson', 'Periferico', 'SN-PR-002', 'Epson', 'PowerLite 119W', 'Disponible', 'Salon 302'),
('Tablet Samsung', 'Tablet', 'SN-TB-003', 'Samsung', 'Galaxy Tab S7', 'En Prestamo', 'Biblioteca'),
('Monitor LG', 'Pantalla', 'SN-MN-004', 'LG', '27UK850-W', 'En Mantenimiento', 'Almacen Central');

-- Préstamos
INSERT INTO prestamos (usuario_id, dispositivo_id, estado_prestamo) VALUES
(2, 3, 'Activo');

-- Mantenimiento
INSERT INTO mantenimiento (dispositivo_id, descripcion, estado_mantenimiento) VALUES
(4, 'Fallo en encendido, revision de placa base', 'En Proceso');

UPDATE dispositivos SET estado = 'En Prestamo' WHERE id = 3;
UPDATE dispositivos SET estado = 'En Mantenimiento' WHERE id = 4;

-- Tabla de correos enviados (notificaciones automáticas)
CREATE TABLE IF NOT EXISTS correos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destinatario VARCHAR(150) NOT NULL,
    asunto VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio DATE NOT NULL,
    hora_envio TIME NOT NULL
);

-- Tabla de mensajería interna entre usuarios
CREATE TABLE IF NOT EXISTS mensajes_internos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remitente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    leido TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
