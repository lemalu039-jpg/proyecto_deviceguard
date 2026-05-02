# DeviceGuard — Documentación Técnica

Sistema web para la gestión, seguimiento y mantenimiento de dispositivos electrónicos. Permite registrar equipos, controlar su ciclo de vida completo, gestionar usuarios por roles, generar reportes y mantener un historial de cambios.

---

## Tabla de contenidos

1. [Estructura del proyecto](#estructura-del-proyecto)
2. [Tecnologías](#tecnologías)
3. [Roles y permisos](#roles-y-permisos)
4. [Base de datos](#base-de-datos)
5. [Backend](#backend)
6. [Frontend](#frontend)
7. [Módulos del sistema](#módulos-del-sistema)
8. [Componentes compartidos](#componentes-compartidos)
9. [Configuración y arranque](#configuración-y-arranque)

---

## Estructura del proyecto

```
proyecto_deviceguard/
├── backend/
│   ├── server.js
│   ├── .env
│   ├── migrate.js
│   └── src/
│       ├── controllers/
│       │   ├── correo.controller.js
│       │   ├── dispositivos.controller.js
│       │   ├── historial.controller.js
│       │   ├── mantenimiento.controller.js
│       │   ├── prestamos.controller.js
│       │   ├── reportes.controller.js
│       │   └── usuarios.controller.js
│       ├── models/
│       │   ├── dispositivos.model.js
│       │   ├── historial.model.js
│       │   ├── mantenimiento.model.js
│       │   ├── prestamos.model.js
│       │   ├── reportes.model.js
│       │   └── usuarios.model.js
│       ├── routes/
│       │   ├── correo.routes.js
│       │   ├── dispositivos.routes.js
│       │   ├── historial.routes.js
│       │   ├── mantenimiento.routes.js
│       │   ├── prestamos.routes.js
│       │   ├── reportes.routes.js
│       │   └── usuarios.routes.js
│       ├── services/
│       │   └── email.service.js
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   └── upload.js
│       ├── database/
│       │   └── connection.js
│       └── uploads/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── css/
│       │   ├── AjustesCuenta.jsx
│       │   ├── AsignacionTareas.jsx
│       │   ├── Calendario.jsx
│       │   ├── CambiarContrasena.jsx
│       │   ├── CambiarCorreo.jsx
│       │   ├── Consultarfiltros.jsx
│       │   ├── Correo.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Dispositivos.jsx
│       │   ├── Equipo.jsx
│       │   ├── Estadisticas.jsx
│       │   ├── GestionMantenimiento.jsx
│       │   ├── HistorialDispositivo.jsx
│       │   ├── Login.jsx
│       │   ├── Papelera.jsx          ← nuevo
│       │   ├── Prestamos.jsx
│       │   ├── Registrarsalida.jsx
│       │   └── Reportes.jsx
│       ├── components/
│       │   ├── Breadcrumbs.jsx
│       │   ├── Navbar.jsx
│       │   ├── Pagination.jsx        ← componente compartido
│       │   └── Sidebar.jsx
│       ├── services/
│       │   └── api.js
│       ├── assets/
│       │   └── icons/
│       └── context/
│           ├── LanguageContext.jsx
│           └── ThemeContext.jsx
└── Docker/
    ├── backend.Dockerfile
    ├── frontend.Dockerfile
    └── docker-compose.yml
```

---

## Tecnologías

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React | 19 |
| Frontend | Vite | 7 |
| Frontend | React Router DOM | 7 |
| Frontend | Axios | 1.x |
| Frontend | Bootstrap | 5.3 |
| Frontend | Recharts | 3.x |
| Backend | Node.js + Express | 5.x |
| Backend | mysql2 | 3.x |
| Backend | multer | 2.x |
| Backend | nodemailer | 8.x |
| Backend | exceljs + pdfkit | — |
| Backend | bcrypt | 6.x |
| Base de datos | MySQL | 8+ |

---

## Roles y permisos

El sistema maneja cuatro roles con permisos y vistas distintas:

| Rol | Descripción |
|---|---|
| `super_admin` | Acceso total al sistema, incluyendo papelera y gestión de equipo |
| `admin` | Acceso amplio, puede eliminar dispositivos y ver papelera |
| `tecnico` | Gestiona mantenimientos, salidas, estadísticas y papelera |
| `usuario` | Solo ve y registra sus propios dispositivos |

### Módulos por rol

| Módulo | super_admin | admin | tecnico | usuario |
|---|:---:|:---:|:---:|:---:|
| Dashboard (Inicio) | ✓ | ✓ | ✓ | ✓ |
| Registro de Dispositivos | ✓ | ✓ | — | ✓ |
| Correo / Mensajería | ✓ | ✓ | ✓ | ✓ |
| Calendario | ✓ | ✓ | ✓ | ✓ |
| Consulta con Filtros | ✓ | ✓ | ✓ | — |
| Asignación de Tareas | ✓ | ✓ | — | — |
| Generar Reportes | ✓ | ✓ | ✓ | — |
| Registrar Salida | ✓ | ✓ | ✓ | — |
| Estadísticas | ✓ | ✓ | ✓ | — |
| Equipo | ✓ | ✓ | — | — |
| Gestión de Mantenimiento | ✓ | ✓ | ✓ | — |
| **Papelera** | ✓ | ✓ | ✓ | — |
| Ajustes de Cuenta | ✓ | ✓ | ✓ | ✓ |

### Redirección post-login

- `tecnico` → `/gestion`
- Todos los demás → `/dashboard`

---

## Base de datos

### Tablas principales

**usuarios** — `nombre`, `correo`, `contrasena` (bcrypt), `rol`, `activo`, `fecha_creacion`.

**estados** — catálogo normalizado de estados de dispositivos:

| id | nombre |
|---|---|
| 1 | En Revision |
| 2 | En Mantenimiento |
| 3 | Listo para Entrega |
| 4 | Entregado |

**dispositivos** — `nombre`, `tipo`, `serial`, `marca`, `ubicacion`, `archivo` (imagen), `descripcion`, `fecha_registro`, `hora_registro`, `estado_id` (FK → estados), `usuario_id` (FK → usuarios), `tecnico_id` (FK → usuarios), **`activo`** (TINYINT — borrado lógico).

**mantenimiento** — `dispositivo_id`, `descripcion`, `costo`, `estado_mantenimiento`, `fecha`, `tecnico_id`.

**correos** — historial de correos automáticos enviados por el sistema.

**mensajes_internos** — mensajería interna entre usuarios del sistema.

### Columna `activo` (borrado lógico)

La columna `activo` en la tabla `dispositivos` implementa eliminación lógica:

- `activo = 1` → dispositivo visible en el sistema
- `activo = 0` → dispositivo en la Papelera (oculto del sistema principal)

Todas las consultas de `findAll`, `findById` y `getAsignados` filtran con `WHERE d.activo = 1`. La papelera usa `WHERE d.activo = 0`.

### Flujo de estados

```
Registro del dispositivo
        ↓
   En Revision (id=1)         ← estado inicial automático
        ↓
  En Mantenimiento (id=2)     ← Gestión de Mantenimiento
        ↓
  Listo para Entrega (id=3)   ← Registrar Salida
        ↓
    Entregado (id=4)           ← Gestión de Mantenimiento
```

Las transiciones están validadas en el backend con el objeto `transicionesPermitidas` en el controlador de dispositivos. El frontend muestra opciones condicionalmente según el estado actual.

---

## Backend

### Arranque (`server.js`)

`require('dotenv').config()` va en la primera línea antes de cualquier `require` de rutas, para garantizar que `process.env` esté disponible en todos los módulos al momento de importarlos.

### Conexión a BD (`src/database/connection.js`)

Usa `mysql2/promise` con pool de conexiones para reutilizar conexiones sin abrir una nueva por petición.

### Modelos

Los modelos encapsulan todas las queries SQL con clases estáticas. Todos los métodos de consulta de dispositivos hacen `LEFT JOIN estados`, `LEFT JOIN usuarios` (registrado_por) y `LEFT JOIN usuarios` (tecnico_asignado) para devolver datos completos sin lógica adicional en el controlador.

### API de dispositivos — rutas

> **Importante:** Las rutas estáticas deben registrarse antes de las rutas con parámetros dinámicos (`/:id`) para evitar que Express capture segmentos como `papelera` o `asignados` como IDs.

```
GET    /api/dispositivos/serial/:serial     → buscar por serial
GET    /api/dispositivos/papelera/todos     → listar papelera (admin, tecnico, super_admin)
GET    /api/dispositivos/asignados/:id      → dispositivos asignados a un técnico
GET    /api/dispositivos                    → listar todos (activo=1)
GET    /api/dispositivos/:id                → obtener uno
POST   /api/dispositivos                    → crear (usuario, super_admin)
PUT    /api/dispositivos/:id/restaurar      → restaurar desde papelera (admin, super_admin)
PUT    /api/dispositivos/:id                → actualizar
DELETE /api/dispositivos/:id/permanente     → eliminar definitivamente (super_admin)
DELETE /api/dispositivos/:id                → borrado lógico — activo=0 (admin, super_admin)
```

### Middleware de roles (`src/middlewares/auth.middleware.js`)

Lee el header `x-usuario-id` de cada petición, busca el usuario en BD y verifica su rol. Responde HTTP 401 si falta el header, HTTP 403 si el rol no tiene permiso.

```js
// Uso en rutas:
router.delete('/:id', verificarRol('super_admin', 'admin'), dispositivosController.delete);
```

### Correos automáticos (`src/services/email.service.js`)

4 eventos: `REGISTRO`, `INICIO_MANTENIMIENTO`, `FIN_MANTENIMIENTO`, `SALIDA`. Cada evento genera un HTML con plantilla estilizada. El flujo es:

1. Inserta en tabla `correos` de la BD (siempre, aunque el email falle)
2. Envía por Gmail con nodemailer

El `transporter` se crea dentro de la función `enviarCorreo()` para leer `process.env` después de que dotenv ya cargó las variables.

---

## Frontend

### Autenticación y rutas (`App.jsx`)

`ProtectedRoute` lee `isAuthenticated` del estado de React. Al cargar, restaura la sesión desde `localStorage`. El login guarda el objeto usuario en `localStorage` y actualiza el estado.

### Tema claro/oscuro (`context/ThemeContext.jsx`)

`ThemeContext` aplica `data-theme="light"` o `data-theme="dark"` al `document.documentElement`. Las variables CSS en `index.css` cambian según el atributo. Todos los colores del sistema usan variables CSS (`--bg-card`, `--border`, `--text-main`, etc.) para garantizar compatibilidad con ambos temas.

### Internacionalización (`context/LanguageContext.jsx`)

`LanguageContext` provee la función `t(key)` para traducir textos. Todos los módulos usan `useLanguage()` para obtener textos en el idioma activo.

### Sidebar (`components/Sidebar.jsx`)

Construye los arrays `menuItems` y `pageItems` condicionalmente según el rol del usuario. Incluye:

- Notificaciones para técnicos (dispositivos en revisión asignados)
- Panel de impersonación para `super_admin` (simular vista de técnico o usuario)
- Entrada **Papelera** visible para `super_admin`, `admin` y `tecnico`

### Componente Pagination (`components/Pagination.jsx`)

Componente reutilizable de paginación usado en todos los módulos con tablas y grillas de cards. Recibe `totalItems`, `itemsPerPage`, `currentPage` y `onPageChange`. Muestra hasta 5 páginas visibles con navegación Anterior/Siguiente.

### Comunicación con el backend (`services/api.js`)

Todas las peticiones usan `axios.create()` con `baseURL: http://localhost:5000/api`. El interceptor agrega `x-usuario-id` automáticamente en cada petición. Las peticiones multipart (subida de imágenes) usan una instancia separada `apiMultipart`.

---

## Módulos del sistema

### Dashboard (Inicio)

- Tarjetas de estadísticas: total dispositivos, por estado, usuarios registrados, total reportes
- Tabla de dispositivos con búsqueda, filtro por estado y paginación (7 filas/página)
- Columna Serial ubicada junto a Nombre para mejor legibilidad
- Serial mostrado en negrilla (`fontWeight: 700, fontFamily: monospace`)
- Columna "Registrado por" visible solo para `super_admin`
- Click en fila navega al historial del dispositivo

### Registro de Dispositivos

- Formulario con Bootstrap Modal para crear y editar
- Subida de imagen con `FormData` (multer en backend)
- Estado inicial automático: `En Revision`
- Función de **reingresar dispositivo** por serial (cambia estado a `En Revision`)
- Botón **Eliminar** abre modal de confirmación y mueve el dispositivo a la Papelera (borrado lógico)
- Contador de registros posicionado al final de la barra de título

### Papelera *(nuevo)*

- Lista dispositivos con `activo = 0` (eliminados lógicamente)
- Columnas: Nombre/Tipo, Serial, Marca, Ubicación, **Estado** (con badge de color), Registrado por, Fecha registro, Acciones
- Paginación: 7 filas por página con componente `<Pagination>`
- Búsqueda por nombre, serial, marca o tipo
- **Restaurar**: devuelve el dispositivo al sistema (`activo = 1`) — disponible para `admin`, `super_admin` y `tecnico`
- **Eliminar permanentemente**: borra el registro de la BD — solo `super_admin`
- Modales de confirmación para ambas acciones
- Toast de confirmación/error tras cada operación
- Muestra mensaje de error descriptivo si el endpoint falla (en lugar de tabla vacía silenciosa)

### Gestión de Mantenimiento

- Lista dispositivos en estado "En Revision" o "En Mantenimiento"
- Select de cambio de estado con opciones condicionales según estado actual
- Transiciones validadas en backend (`transicionesPermitidas`)
- Columna "Registrado por" visible para `super_admin`

### Asignación de Tareas *(nuevo)*

- Panel de técnicos con conteo de tareas activas por técnico
- Cards de técnicos paginadas (8 por página)
- Tabla de dispositivos pendientes de asignación (estado "En Revision" sin técnico)
- Select para asignar técnico a cada dispositivo
- Búsqueda en la tabla de pendientes

### Registrar Salida

- Busca dispositivo por serial, valida estado "En Mantenimiento"
- Actualiza a "Listo para Entrega" con fecha y hora automáticas
- Contador de registros posicionado al final de la barra de título
- Columna "Registrado por" visible para `super_admin`

### Consulta con Filtros

- Filtros por fecha, nombre, ubicación y estado
- Columna Serial ubicada junto a Nombre
- Serial en negrilla
- Paginación: 7 filas por página

### Correo / Mensajería

- Historial de correos automáticos del sistema
- Mensajería interna entre usuarios con polling cada 4 segundos
- Modo oscuro completamente compatible (sin franjas blancas): todos los colores usan variables CSS (`--border`, `--bg-main`, `--bg-card`)

### Reportes

- Vista previa de datos (usuarios o dispositivos) con búsqueda y paginación (7 filas/página)
- Exportación a `.xlsx` (ExcelJS) y `.pdf` (PDFKit)
- Filtros por rango de fechas y rol/estado
- Contador de reportes generados

### Estadísticas

- Filtros encadenados: año → mes → estado → tipo (con `useMemo`)
- Donut SVG manual con porcentajes por estado
- Barras horizontales por estado
- Gráfica de líneas (Recharts) con filtro de estado independiente
- Tarjetas por tipo de dispositivo
- Tabla de dispositivos con búsqueda, filtro de estado y paginación (7 filas/página)
- Columna Tipo eliminada de la tabla — el tipo aparece como subtítulo bajo el nombre
- Serial en negrilla

### Equipo

- Cards de usuarios paginadas: **8 cards por página** con componente `<Pagination>`
- Tabla de usuarios con búsqueda y paginación (7 filas/página)
- Badges de rol: Super Admin, Administrador, Técnico, Usuario
- Botón "Mensaje" navega al correo con el contacto preseleccionado
- Acciones: editar, suspender/activar usuario

### Calendario

- Vista mensual de dispositivos registrados
- Filtrado por `usuario_id` para el rol `usuario`

### Historial de Dispositivo

- Timeline de cambios de estado del dispositivo
- Observaciones manuales con fecha y autor

### Ajustes de Cuenta

- Cambiar nombre, correo y contraseña
- Subpáginas: `CambiarCorreo.jsx`, `CambiarContrasena.jsx`

---

## Componentes compartidos

### Pagination (`components/Pagination.jsx`)

Usado en todos los módulos con tablas o grillas. Configuración estándar en cada módulo:

```jsx
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 7; // tablas | 8 para cards de Equipo/AsignacionTareas

// En el JSX:
const datosPaginados = datos.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

<Pagination
  totalItems={datos.length}
  itemsPerPage={itemsPerPage}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
/>
```

### Badges de estado

Estilo consistente en todos los módulos:

| Estado | Fondo | Color texto |
|---|---|---|
| En Revision | `#f3e8ff` | `#7e22ce` |
| En Mantenimiento | `#ffedd5` | `#ea580c` |
| Listo para Entrega | `#fcfbdc` | `#dacd1c` |
| Entregado | `#f3fef2` | `#16a34a` |

### Estilo de columna Nombre + Tipo

Patrón usado en todas las tablas del sistema:

```jsx
<td>
  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.82rem' }}>
    {d.nombre}
  </div>
  <div style={{ fontSize: '.71rem', color: 'var(--text-muted)', marginTop: '1px' }}>
    {d.tipo || ''}
  </div>
</td>
```

### Estilo de columna Serial

Serial en negrilla con fuente monoespaciada en todas las tablas:

```jsx
<td style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
  {d.serial}
</td>
```

### Contador de registros

Posicionado al final de la barra de título (después de filtros y botón limpiar):

```jsx
<span style={{
  fontSize: '.72rem', color: 'var(--text-muted)',
  background: 'var(--input-bg)', padding: '3px 10px',
  borderRadius: '20px', fontWeight: 600, marginLeft: 'auto'
}}>
  {datos.length} registros
</span>
```

---

## Configuración y arranque

### Variables de entorno (`backend/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=device_guard_db
DB_PORT=3306
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=contraseña_de_aplicacion_gmail
```

> `EMAIL_PASS` debe ser una contraseña de aplicación de Gmail (no la contraseña normal de la cuenta).

### Super admin inicial

```sql
INSERT INTO usuarios (nombre, correo, contrasena, rol)
VALUES ('Super Admin', 'superadmin@deviceguard.com', 'superadmin123', 'super_admin');
```

### Ejecutar el proyecto

```bash
# 1. Base de datos: ejecutar database.sql en MySQL Workbench o CLI

# 2. Backend
cd backend
npm install
npm start        # http://localhost:5000

# 3. Frontend
cd frontend
npm install
npm run dev      # http://localhost:5173
```

> **Nota:** Cada vez que se modifiquen archivos del backend, el servidor debe reiniciarse (`Ctrl+C` y `npm start`) para que los cambios surtan efecto. Express carga las rutas en memoria al arrancar.

> Si el backend no responde, verificar instancias en el puerto 5000:
> ```
> netstat -ano | findstr :5000
> taskkill /PID <pid> /F
> ```

### Docker (opcional)

```bash
cd Docker
docker-compose up --build
```

---

## Notas de desarrollo

### Orden de rutas en Express

Las rutas estáticas deben registrarse **antes** de las rutas con parámetros dinámicos. Si `/:id` se registra antes que `/papelera/todos`, Express captura `papelera` como un ID y el endpoint nunca llega a su controlador.

```js
// ✓ Correcto
router.get('/papelera/todos', controller.getPapelera);
router.get('/asignados/:tecnico_id', controller.getAsignados);
router.get('/:id', controller.getById);  // al final

// ✗ Incorrecto — /:id captura todo antes
router.get('/:id', controller.getById);
router.get('/papelera/todos', controller.getPapelera); // nunca llega aquí
```

### Interceptor de Axios

El header `x-usuario-id` se agrega automáticamente en cada petición. El middleware `verificarRol` lo requiere para autenticar. Si falta, responde HTTP 401.

### Borrado lógico

El botón "Eliminar" en el módulo de Dispositivos **no borra el registro de la BD**. Ejecuta `UPDATE dispositivos SET activo = 0`, lo que mueve el dispositivo a la Papelera. Desde la Papelera se puede restaurar (`activo = 1`) o eliminar definitivamente (`DELETE FROM dispositivos`).
