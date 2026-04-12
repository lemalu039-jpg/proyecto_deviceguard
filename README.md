# DeviceGuard

Sistema web para la gestión y seguimiento de dispositivos electrónicos, orientado al control de mantenimiento, préstamos y estados de equipos dentro de una organización.

---

## Módulos del sistema

### Login
Autenticación de usuarios con correo y contraseña. Redirige al dashboard según el rol (admin / usuario).

### Dashboard
Vista general con estadísticas en tiempo real: total de dispositivos, cantidad por estado, lista de dispositivos recientes con imagen, nombre, serial, ubicación y estado.

### Registro de Dispositivos
Permite registrar nuevos dispositivos con nombre, tipo, serial, marca, ubicación e imagen. También permite editar, eliminar y **reingresar** un dispositivo existente al flujo de mantenimiento mediante su serial.

### Consulta con Filtros
Tabla de dispositivos con filtros combinables por fecha de registro, nombre, ubicación y estado. Permite búsquedas específicas sin modificar datos.

### Gestión de Mantenimiento
Lista los dispositivos en estado "En Revision" o "Listo para Entrega". Permite cambiar el estado según el flujo permitido:
- En Revision → En Mantenimiento
- Listo para Entrega → Entregado

### Registrar Salida
Registra la salida de dispositivos que están "En Mantenimiento", actualizando su estado a "Listo para Entrega" con fecha y hora automáticas.

### Módulo de Equipo (Usuarios)
Lista todos los usuarios del sistema con sus datos, rol y fecha de registro. Permite agregar, editar y eliminar usuarios. Incluye buscador por nombre o correo y opción de enviar mensajes internos.

### Correos
Historial de correos automáticos enviados por el sistema ante eventos (registro, mantenimiento, salida). También incluye mensajería interna entre usuarios del sistema.

### Reportes
Generación de reportes en formato Excel (.xlsx) para usuarios y dispositivos, con filtro opcional por rango de fechas. El nombre del archivo incluye fecha y hora de generación.

### Historial
Seguimiento del historial de estados de un dispositivo específico.

---

## Flujo del sistema

```
Registro → En Revision → En Mantenimiento → Listo para Entrega → Entregado
```

Cada transición de estado genera un correo automático al administrador del sistema.

---

## Base de datos

| Tabla | Descripción |
|---|---|
| `usuarios` | Usuarios del sistema con rol admin o usuario |
| `dispositivos` | Equipos registrados con relación a estado y usuario que registra |
| `estados` | Catálogo normalizado de estados: En Revision, En Mantenimiento, Listo para Entrega, Entregado |
| `mantenimiento` | Registros de mantenimiento con técnico asignado y estado del proceso |
| `correos` | Historial de correos automáticos enviados |
| `mensajes_internos` | Mensajería interna entre usuarios |
| `prestamos` | Registro de préstamos de dispositivos |

---

## Tecnologías utilizadas

**Frontend**
- React + Vite
- React Router DOM
- Axios
- Bootstrap (modales)

**Backend**
- Node.js + Express
- MySQL2 (pool de conexiones)
- Nodemailer (envío de correos)
- Multer (carga de imágenes)
- ExcelJS (generación de reportes)
- dotenv

**Base de datos**
- MySQL

---

## Instrucciones de uso

### Requisitos
- Node.js v18+
- MySQL corriendo en el puerto configurado en `.env`

### Backend

```bash
cd backend
npm install
npm start
```

Crea el archivo `backend/.env` con:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=device_guard_db
DB_PORT=3306
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

> Para EMAIL_PASS usa una contraseña de aplicación de Gmail (no tu contraseña normal).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Base de datos

Ejecuta el archivo `database.sql` en tu gestor de MySQL para crear las tablas e insertar datos iniciales.
