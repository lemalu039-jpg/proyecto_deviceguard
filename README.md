# DeviceGuard — Documentación Técnica

Sistema web para la gestión, seguimiento y mantenimiento de dispositivos electrónicos. Permite registrar equipos, controlar su ciclo de vida completo, gestionar usuarios por roles y generar reportes.

---

## Estructura del proyecto

```
proyecto_deviceguard/
├── backend/
│   ├── server.js
│   ├── .env
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── middlewares/
│       ├── database/
│       └── uploads/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── assets/
│       └── context/
└── database.sql
```

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, React Router DOM v7, Axios, Bootstrap 5, Recharts |
| Backend | Node.js, Express 5, mysql2, dotenv, multer, nodemailer, exceljs |
| Base de datos | MySQL |

---

## Roles del sistema

El sistema maneja tres roles con permisos y vistas distintas:

| Rol | Descripción |
|---|---|
| `super_admin` | Acceso total al sistema |
| `tecnico` | Gestiona mantenimientos, salidas y consultas |
| `usuario` | Solo ve y registra sus propios dispositivos |

### Módulos por rol

**super_admin** ve todo: Dashboard, Registro de Dispositivos, Correo, Calendario, Consulta con Filtros, Generar Reportes, Registrar Salida, Estadísticas, Equipo, Gestión de Mantenimiento.

**tecnico** ve: Dashboard, Correo, Calendario, Consulta con Filtros, Gestión de Mantenimiento, Registrar Salida, Generar Reportes, Estadísticas.

**usuario** ve: Dashboard, Registro de Dispositivos, Correo, Calendario. Solo ve sus propios dispositivos (filtrado por `usuario_id`).

### Redirección post-login

- `usuario` y `super_admin` → `/dashboard`
- `tecnico` → `/gestion`

---

## Base de datos

### Tablas principales

**usuarios** — nombre, correo, contraseña, rol (`super_admin`, `tecnico`, `usuario`), fecha_creacion.

**estados** — catálogo normalizado de estados de dispositivos:

| id | nombre |
|---|---|
| 1 | En Revision |
| 2 | En Mantenimiento |
| 3 | Listo para Entrega |
| 4 | Entregado |

**dispositivos** — nombre, tipo, serial, marca, ubicación, imagen, fechas, `estado_id` (FK a estados), `usuario_id` (FK a usuarios — quien lo registró).

**mantenimiento** — dispositivo_id, descripcion, costo, estado_mantenimiento, fechas, `tecnico_id` (FK a usuarios — quien realiza el mantenimiento).

**correos** — historial de correos automáticos enviados por el sistema.

**mensajes_internos** — mensajería entre usuarios del sistema.

### Flujo de estados

```
Registro del dispositivo
        ↓
   En Revision (id=1)       ← estado inicial automático
        ↓
  En Mantenimiento (id=2)   ← Gestión de Mantenimiento
        ↓
  Listo para Entrega (id=3) ← Registrar Salida
        ↓
    Entregado (id=4)         ← Gestión de Mantenimiento
```

Las transiciones están validadas en frontend (select condicional) y backend (objeto `transicionesPermitidas`).

---

## Backend

### Arranque (`server.js`)

`require('dotenv').config()` va en la primera línea antes de cualquier `require` de rutas, para garantizar que `process.env` esté disponible en todos los módulos al momento de importarlos.

### Conexión a BD (`src/database/connection.js`)

Usa `mysql2/promise` con pool de conexiones para reutilizar conexiones sin abrir una nueva por petición.

### Modelos

Los modelos encapsulan todas las queries SQL con clases estáticas. Todos los `findAll`, `findById` y `findBySerial` de dispositivos hacen `LEFT JOIN estados` y `LEFT JOIN usuarios` para devolver `estado` (texto) y `registrado_por` (nombre del usuario), manteniendo compatibilidad con el frontend sin cambios en el cliente.

### Middleware de roles (`src/middlewares/auth.middleware.js`)

Lee el header `x-usuario-id` de cada petición, busca el usuario en BD y verifica su rol. Responde HTTP 403 si no tiene permiso.

```
Rutas protegidas:
POST /api/mantenimiento    → tecnico, super_admin
POST /api/dispositivos     → usuario, super_admin
POST/PUT/DELETE /api/usuarios → super_admin
POST /api/usuarios/registro → público, siempre asigna rol: 'usuario'
```

### Asignación automática de IDs

- `usuario_id` en dispositivos: se toma del header `x-usuario-id` en el controller `create`.
- `tecnico_id` en mantenimiento: se toma del header `x-usuario-id` en el controller `create`.

El frontend envía este header automáticamente en cada petición gracias al interceptor de axios en `api.js`:

```js
api.interceptors.request.use(config => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.id) config.headers['x-usuario-id'] = usuario.id;
    return config;
});
```

### Correos automáticos (`src/services/email.service.js`)

4 eventos: `REGISTRO`, `INICIO_MANTENIMIENTO`, `FIN_MANTENIMIENTO`, `SALIDA`. Cada evento genera un HTML con plantilla estilizada. El flujo es:

1. Inserta en tabla `correos` de la BD (siempre, aunque el email falle)
2. Envía por Gmail con nodemailer

El `transporter` se crea dentro de la función `enviarCorreo()` para leer `process.env` después de que dotenv ya cargó las variables.

---

## Frontend

### Autenticación y rutas (`App.jsx`)

`ProtectedRoute` lee `isAuthenticated` del estado de React. Al cargar, restaura la sesión desde `localStorage`. El login guarda el objeto usuario en `localStorage` y actualiza el estado. La redirección post-login depende del rol.

### Tema claro/oscuro

`ThemeContext` aplica `data-theme="light"` o `data-theme="dark"` al `document.documentElement`. Las variables CSS en `index.css` cambian según el atributo.

- Modo claro: `--sidebar-active-bg: #151E3D` (sólido)
- Modo oscuro: `--sidebar-active-bg: linear-gradient(135deg, #0492C2, #82EEFD)` (degradado)

### Sidebar (`components/Sidebar.jsx`)

Lee el rol del usuario desde la prop `usuario` (pasada por `App.jsx`) o como fallback desde `localStorage`. Construye los arrays `menuItems` y `pageItems` condicionalmente según el rol. El scrollbar es invisible por defecto y aparece tenuemente al hacer hover sobre el sidebar.

### Comunicación con el backend (`services/api.js`)

Todas las peticiones usan `axios.create()` con `baseURL`. El interceptor agrega `x-usuario-id` automáticamente. Las peticiones multipart (subida de imágenes) usan una instancia separada `apiMultipart` que también incluye el interceptor.

---

## Módulos

### Login

Detecta el tema con `document.documentElement.getAttribute('data-theme')` y aplica estilos distintos para modo oscuro. El registro público siempre asigna `rol: 'usuario'` ignorando cualquier valor enviado.

### Dashboard

Filtra dispositivos por `usuario_id` cuando el rol es `usuario`. Los roles `super_admin` y `tecnico` ven todos. El texto "X usuarios registrados" solo aparece para roles distintos de `usuario`. Las tarjetas de estadísticas muestran conteos por estado.

### Registro de Dispositivos

Formulario con Bootstrap Modal. Usa `FormData` para enviar imagen junto con los demás campos. El estado se asigna automáticamente a `En Revision` (estado_id=1). Incluye función de **reingresar dispositivo** por serial.

### Gestión de Mantenimiento

Lista dispositivos en estado "En Revision" o "Listo para Entrega". El select de cambio de estado muestra opciones condicionalmente según el estado actual. Incluye columna "Registrado por" con el nombre del usuario que registró el dispositivo.

### Registrar Salida

Busca dispositivo por serial, valida que esté "En Mantenimiento" y lo actualiza a "Listo para Entrega" con fecha y hora automáticas. Incluye columna "Registrado por" para el super_admin.

### Consulta con Filtros

Filtra en el cliente con `.filter()`. El valor del `<option>` debe coincidir exactamente (case-sensitive) con el nombre devuelto por el JOIN del backend.

### Correo

Historial de correos automáticos filtrado por dispositivos del usuario cuando el rol es `usuario`. Incluye mensajería interna entre usuarios con polling cada 4 segundos.

### Reportes

Genera `.xlsx` con ExcelJS. Acepta filtros por fecha (`desde`, `hasta`). El nombre del archivo incluye fecha y hora: `reporte_usuarios_2026-04-12_14-30.xlsx`. El frontend lee el header `Content-Disposition` para usar ese nombre al descargar.

### Estadísticas

4 visualizaciones: donut SVG manual, barras horizontales, gráfica de líneas (Recharts) y tarjetas por tipo. Los filtros están encadenados con `useMemo`.

### Equipo

Lista usuarios con búsqueda en tiempo real. Badges de rol: Super Admin (amarillo), Técnico (azul), Usuario (verde). El super_admin puede crear usuarios con rol `usuario` o `tecnico`. El botón "Message" no aparece cuando el usuario de la tarjeta es el mismo logueado.

### Calendario

Filtra dispositivos por `usuario_id` para el rol `usuario`. El botón "Agregar evento" y "Registrar salida" solo aparecen para roles distintos de `usuario`.

---

## Columna "Registrado por"

Aparece en Dashboard, Consulta con Filtros, Registrar Salida y Gestión de Mantenimiento, solo cuando el rol es `super_admin`. El backend devuelve `registrado_por` mediante `LEFT JOIN usuarios ON d.usuario_id = u.id` en todas las consultas de dispositivos.

Para asignar `registrado_por` a dispositivos existentes con `usuario_id = NULL`:

```sql
UPDATE dispositivos SET usuario_id = 1 WHERE usuario_id IS NULL;
-- Reemplaza 1 con el id del super_admin
```

---

## Configuración

### Variables de entorno (`backend/.env`)

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=device_guard_db
DB_PORT=3306
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=contraseña_de_aplicacion_gmail
```

> `EMAIL_PASS` debe ser una contraseña de aplicación de Gmail, no la contraseña normal.

### Super admin inicial

```sql
INSERT INTO usuarios (nombre, correo, contrasena, rol)
VALUES ('Super Admin', 'superadmin@deviceguard.com', 'superadmin123', 'super_admin');
```

### Ejecutar el proyecto

```bash
# Base de datos: ejecutar database.sql en MySQL

# Backend
cd backend
npm install
npm start        # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev      # http://localhost:5173
```

> Si el backend no responde, verificar instancias en el puerto 5000:
> `netstat -ano | findstr :5000` y terminar con `taskkill /PID <pid> /F`
