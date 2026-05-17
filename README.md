# DeviceGuard — Documentación Técnica

Sistema web para la gestión, seguimiento y mantenimiento de dispositivos electrónicos. Permite registrar equipos, controlar su ciclo de vida completo, gestionar usuarios por roles, generar reportes, mantener un historial de cambios y procesar pagos de mantenimiento mediante Wompi.

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
9. [Pagos con Wompi](#pagos-con-wompi)
10. [Correos automáticos](#correos-automáticos)
11. [Configuración y arranque](#configuración-y-arranque)
12. [Notas de desarrollo](#notas-de-desarrollo)

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
│       │   ├── calificaciones.controller.js  
│       │   ├── correo.controller.js
│       │   ├── dispositivos.controller.js
│       │   ├── historial.controller.js
│       │   ├── mantenimiento.controller.js
│       │   ├── pagos.controller.js           
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
│       │   ├── calificaciones.routes.js      
│       │   ├── correo.routes.js
│       │   ├── dispositivos.routes.js
│       │   ├── historial.routes.js
│       │   ├── mantenimiento.routes.js
│       │   ├── pagos.routes.js               
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
│       │   ├── Calificaciones.jsx            
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
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Papelera.jsx
│       │   ├── PagoMantenimiento.jsx         
│       │   ├── Prestamos.jsx
│       │   ├── Registrarsalida.jsx
│       │   └── Reportes.jsx
│       ├── components/
│       │   ├── Breadcrumbs.jsx
│       │   ├── Navbar.jsx
│       │   ├── Pagination.jsx
│       │   ├── Sidebar.jsx
│       │   └── TableSkeleton.jsx
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
| Pagos | Wompi (widget JS) | — |

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
| **Calificaciones** | ✓ | ✓ | ✓ | — |
| **Pago de Mantenimiento** | — | — | — | ✓ |
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

**mantenimiento** — `dispositivo_id`, `descripcion`, `costo`, `estado_mantenimiento`, `fecha`, `tecnico_id`, `estado_pago`, `referencia_pago`, `transaccion_id`, `fecha_pago`.

> Las columnas `transaccion_id` y `fecha_pago` se agregaron para soportar el flujo de pagos con Wompi. Se actualizan cuando el usuario completa el pago o cuando Wompi notifica el resultado vía webhook.

```sql
ALTER TABLE mantenimiento
  ADD COLUMN transaccion_id VARCHAR(100) NULL AFTER referencia_pago,
  ADD COLUMN fecha_pago     DATETIME     NULL AFTER transaccion_id;
```

**correos** — historial de correos automáticos enviados por el sistema.

**mensajes_internos** — mensajería interna entre usuarios del sistema.

**calificaciones** — `dispositivo_id`, `tecnico_id`, `estrellas_empresa`, `estrellas_tecnico`, `comentario`, `fecha`. Registra la calificación del servicio por parte del usuario al recibir su dispositivo.

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
  En Mantenimiento (id=2)     ← Gestión de Mantenimiento (con costo registrado)
        ↓
  Listo para Entrega (id=3)   ← Gestión de Mantenimiento / Calendario
        ↓
    Entregado (id=4)           ← Gestión de Mantenimiento / Calendario
```

Las transiciones están validadas en el backend con el objeto `transicionesPermitidas` en el controlador de dispositivos. El frontend muestra opciones condicionalmente según el estado actual.

### Flujo de pago de mantenimiento

```
Técnico registra costo al pasar a "En Mantenimiento"
        ↓
  estado_pago = 'Pendiente' en tabla mantenimiento
        ↓
  Usuario ve botón "Pagar $X" en su Dashboard
        ↓
  Usuario abre PagoMantenimiento.jsx → widget Wompi
        ↓
  Wompi aprueba → POST /api/pagos/confirmar
        ↓
  estado_pago = 'Pagado', transaccion_id y fecha_pago guardados
        ↓
  Técnico/Admin ven badge "Pagado" en Gestión de Mantenimiento
```

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

### API de mantenimiento — rutas

```
GET    /api/mantenimiento           → listar todos
GET    /api/mantenimiento/:id       → obtener uno
POST   /api/mantenimiento           → crear registro
PUT    /api/mantenimiento/:id       → actualizar
POST   /api/mantenimiento/costo     → registrar costo del mantenimiento activo
DELETE /api/mantenimiento/:id       → eliminar
```

### API de pagos — rutas

```
GET    /api/pagos/datos/:dispositivoId  → datos del pago (monto, referencia, estado_pago, public_key)
POST   /api/pagos/confirmar             → confirmar pago tras aprobación de Wompi
POST   /api/pagos/webhook               → webhook público — Wompi notifica cambios de estado
```

### API de calificaciones — rutas

```
GET    /api/calificaciones                      → listar todas
GET    /api/calificaciones/tecnico/:tecnicoId   → calificaciones de un técnico
GET    /api/calificaciones/serial/:serial       → buscar dispositivo por serial (para el formulario público)
POST   /api/calificaciones                      → crear calificación
```

### API de usuarios — rutas

```
POST   /api/usuarios/login          → autenticación
POST   /api/usuarios/registro       → crear usuario
GET    /api/usuarios                → listar todos
GET    /api/usuarios/:id            → obtener uno
PUT    /api/usuarios/:id            → editar
PUT    /api/usuarios/:id/status     → activar/desactivar
DELETE /api/usuarios/:id            → eliminar
```

### API de reportes — rutas

```
GET    /api/reportes/usuarios-excel        → exportar usuarios a .xlsx
GET    /api/reportes/dispositivos-excel    → exportar dispositivos a .xlsx
GET    /api/reportes/usuarios-pdf          → exportar usuarios a .pdf
GET    /api/reportes/dispositivos-pdf      → exportar dispositivos a .pdf
GET    /api/reportes/preview/usuarios      → vista previa paginada de usuarios
GET    /api/reportes/preview/dispositivos  → vista previa paginada de dispositivos
GET    /api/reportes/total                 → total de reportes generados
```

### Corrección de `tecnico_id` en headers

Los headers HTTP siempre llegan como strings. Si el header `x-usuario-id` no viene, su valor es `undefined` (no `null`), lo que causaba un error de FK en MySQL al intentar insertar `"undefined"` en una columna `INT`. La corrección aplicada en todos los controladores:

```js
// ✓ Correcto — convierte a entero o null
const tecnico_id = req.headers['x-usuario-id']
  ? parseInt(req.headers['x-usuario-id'])
  : null;

// ✗ Incorrecto — puede pasar "undefined" como string a MySQL
const tecnico_id = req.headers['x-usuario-id'] || null;
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
- **Columna "Pago"** *(nueva, solo para rol `usuario`)*:
  - `—` si el dispositivo no tiene mantenimiento activo con costo
  - Badge verde **Pagado** si el pago fue completado
  - Botón **"Pagar $X"** si hay un pago pendiente — navega a `/pago/:dispositivoId`

```jsx
// Carga de estado de pago en el useEffect del Dashboard
if (usuarioActual.rol === 'usuario' && dispositivos.length > 0) {
  const pagosMap = {};
  await Promise.all(
    dispositivos.map(async (d) => {
      try {
        const res = await api.get(`/pagos/datos/${d.id}`);
        pagosMap[d.id] = res.data; // { monto, referencia, estado_pago }
      } catch {
        pagosMap[d.id] = null;
      }
    })
  );
  setPagosDispositivos(pagosMap);
}
```

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

- Lista dispositivos en estado "En Revision", "En Mantenimiento" o "Listo para Entrega"
- Select de cambio de estado con opciones condicionales según estado actual
- Al cambiar a "En Mantenimiento" se abre un **modal de registro de costo** antes de confirmar
- El costo viaja en el mismo request del cambio de estado (`costo_mantenimiento` en el body)
- Transiciones validadas en backend (`transicionesPermitidas`)
- **Columna "Estado de pago"** *(nueva)*: muestra el estado del pago del mantenimiento activo
  - `—` si el dispositivo no tiene mantenimiento activo con costo registrado
  - Badge amarillo **Pendiente** si el usuario aún no ha pagado
  - Badge verde **Pagado** si el pago fue completado
- Columna "Registrado por" visible para `super_admin`

```jsx
// Carga del estado de pago por dispositivo
const pagosMap = {};
await Promise.all(
  filtrados.map(async (d) => {
    try {
      const r = await api.get(`/pagos/datos/${d.id}`);
      pagosMap[d.id] = r.data.estado_pago || 'Pendiente';
    } catch {
      pagosMap[d.id] = null; // sin mantenimiento activo con costo
    }
  })
);
setEstadosPago(pagosMap);
```

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

---

## Mensajería interna

El módulo de Correo (`/correo`) tiene dos vistas independientes dentro de la misma página: el historial de correos automáticos y el chat de mensajería interna entre usuarios del sistema.

### Tabla en base de datos

```sql
CREATE TABLE mensajes_internos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  remitente_id    INT NOT NULL,
  destinatario_id INT NOT NULL,
  mensaje         TEXT NOT NULL,
  leido           TINYINT(1) DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (remitente_id)    REFERENCES usuarios(id),
  FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
);
```

La columna `leido` es clave: permite mostrar badges de mensajes no leídos en la lista de contactos y limpiarlos automáticamente al abrir la conversación.

### Endpoints de mensajería

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/correo/mensajes` | Enviar un mensaje interno |
| `GET` | `/api/correo/mensajes/contactos/:userId` | Lista de todos los usuarios con conteo de no leídos |
| `GET` | `/api/correo/mensajes/conversacion/:userId/:contactId` | Mensajes entre dos usuarios (marca como leídos) |

### Cómo funciona el backend

**Enviar mensaje** — inserta directamente en `mensajes_internos`:

```js
exports.enviarMensaje = async (req, res) => {
  const { remitente_id, destinatario_id, mensaje } = req.body;
  await db.query(
    "INSERT INTO mensajes_internos (remitente_id, destinatario_id, mensaje) VALUES (?, ?, ?)",
    [remitente_id, destinatario_id, mensaje]
  );
};
```

**Obtener conversación** — trae todos los mensajes entre dos usuarios en orden cronológico y marca como leídos los recibidos:

```js
exports.obtenerConversacion = async (req, res) => {
  const { userId, contactId } = req.params;
  const [rows] = await db.query(
    `SELECT m.*, u.nombre AS remitente_nombre
     FROM mensajes_internos m
     JOIN usuarios u ON u.id = m.remitente_id
     WHERE (m.remitente_id = ? AND m.destinatario_id = ?)
        OR (m.remitente_id = ? AND m.destinatario_id = ?)
     ORDER BY m.created_at ASC`,
    [userId, contactId, contactId, userId]
  );
  // Marcar como leídos los mensajes recibidos por userId
  await db.query(
    "UPDATE mensajes_internos SET leido = 1 WHERE destinatario_id = ? AND remitente_id = ? AND leido = 0",
    [userId, contactId]
  );
  res.json(rows);
};
```

**Obtener contactos** — devuelve todos los usuarios del sistema (excepto el propio) con el conteo de mensajes no leídos de cada uno:

```js
exports.obtenerContactos = async (req, res) => {
  const { userId } = req.params;
  const [rows] = await db.query(
    `SELECT u.id, u.nombre, u.correo,
       (SELECT COUNT(*) FROM mensajes_internos m
        WHERE m.remitente_id = u.id AND m.destinatario_id = ? AND m.leido = 0) AS no_leidos
     FROM usuarios u
     WHERE u.id != ?
     ORDER BY u.nombre ASC`,
    [userId, userId]
  );
  res.json(rows);
};
```

### Cómo funciona el frontend

El componente `Correo.jsx` maneja dos vistas con la constante `VISTAS`:

```js
const VISTAS = { ENVIADOS: "enviados", CHAT: "chat" };
const [vista, setVista] = useState(VISTAS.ENVIADOS);
```

**Polling cada 4 segundos** — en lugar de WebSockets, el chat usa `setInterval` para consultar mensajes nuevos. El intervalo se limpia y recrea cada vez que cambia el contacto activo:

```js
useEffect(() => {
  clearInterval(pollingRef.current);
  if (contactoActivo && userId) {
    cargarConversacion(contactoActivo.id);
    pollingRef.current = setInterval(() => {
      if (contactoActivoRef.current) {
        cargarConversacion(contactoActivoRef.current.id);
      }
    }, 4000);
  }
  return () => clearInterval(pollingRef.current);
}, [contactoActivo]);
```

> Se usa `contactoActivoRef` (un `useRef`) dentro del intervalo para evitar el problema de *stale closure* — si se usara el estado directamente, el intervalo capturaría el valor inicial de `contactoActivo` y nunca lo actualizaría.

**Limpieza de badges sin re-render innecesario** — al abrir una conversación, el badge de no leídos se limpia localmente en el array de contactos sin hacer una nueva petición al servidor:

```js
setContactos(prev => {
  const idx = prev.findIndex(c => c.id === contactId);
  if (idx === -1 || prev[idx].no_leidos === 0) return prev; // sin cambio = sin re-render
  const next = [...prev];
  next[idx] = { ...next[idx], no_leidos: 0 };
  return next;
});
```

**Scroll automático al último mensaje** — usando una referencia al final del contenedor de mensajes:

```js
const chatEndRef = useRef(null);
useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [mensajes]);

// En el JSX, al final de la lista de mensajes:
<div ref={chatEndRef} />
```

**Contacto preseleccionado desde Equipo** — el módulo de Equipo puede navegar al chat con un contacto ya seleccionado usando `location.state`:

```js
// En Equipo.jsx al hacer click en "Mensaje":
navigate('/correo', { state: { contacto: { id: usuario.id, nombre: usuario.nombre } } });

// En Correo.jsx, se detecta al montar:
useEffect(() => {
  if (contactoInicializado.current) return;
  if (location.state?.contacto && contactos.length > 0) {
    const c = contactos.find(x => x.id === location.state.contacto.id) || location.state.contacto;
    setContactoActivoSafe(c);
    setVista(VISTAS.CHAT);
    contactoInicializado.current = true; // evita que se ejecute más de una vez
  }
}, [contactos]);
```

### Estructura visual del módulo

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR                │  PANEL PRINCIPAL           │
│  ─────────────────────  │  ─────────────────────     │
│  📧 Mi Correo           │                            │
│                         │  Vista ENVIADOS:           │
│  NOTIFICACIONES         │  Tabla con historial de    │
│  ✉ Enviados  [12]       │  correos automáticos       │
│                         │  (destinatario, asunto,    │
│  MENSAJERÍA             │   mensaje, fecha, hora)    │
│  💬 Mensajes  [3]       │                            │
│                         │  Vista CHAT:               │
│  USUARIOS               │  Burbujas de mensajes      │
│  👤 Ana García  [2]     │  con scroll automático     │
│  👤 Carlos López        │  e input para responder    │
│  👤 María Torres        │                            │
└─────────────────────────────────────────────────────┘
```

### Diferencia entre correos automáticos y mensajería interna

| | Correos automáticos | Mensajería interna |
|---|---|---|
| **Origen** | Sistema (eventos de dispositivos) | Usuarios del sistema |
| **Destino** | Correo electrónico externo (Gmail) | Dentro de la plataforma |
| **Tabla BD** | `correos` | `mensajes_internos` |
| **Tecnología** | Nodemailer + Gmail SMTP | Polling HTTP cada 4s |
| **Vista** | Historial de enviados (solo lectura) | Chat bidireccional en tiempo casi real |

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
- Filtrado por `tecnico_id` para el rol `tecnico` (solo sus dispositivos asignados)
- Eventos en celdas del calendario con badge de color según estado
- Panel lateral con eventos del día seleccionado y eventos del mes
- Acciones desde el calendario: cambiar estado del dispositivo (con modal de confirmación)
- Al pasar a "En Mantenimiento" desde el calendario, solicita el costo antes de confirmar
- Eventos personalizados: técnicos y admins pueden agregar fechas estimadas de entrega

### Calificaciones *(nuevo)*

Módulo accesible desde la página pública (`Home.jsx`) sin necesidad de login. Permite a los usuarios calificar el servicio después de recibir su dispositivo.

**Flujo:**
1. El usuario ingresa el serial de su dispositivo en el formulario público
2. El sistema busca el dispositivo y muestra nombre, marca y técnico asignado
3. El usuario califica la empresa (1–5 estrellas) y opcionalmente al técnico
4. Puede agregar un comentario libre
5. La calificación se guarda en la tabla `calificaciones`

**Vista interna** (`/calificaciones`): técnicos y admins ven todas las calificaciones recibidas con promedio de estrellas por técnico.

```js
// Endpoint de búsqueda por serial (público, sin autenticación)
GET /api/calificaciones/serial/:serial
// Devuelve: { id, nombre, marca, serial, tecnico_id, tecnico_nombre }

// Crear calificación
POST /api/calificaciones
// Body: { dispositivo_id, tecnico_id, estrellas_empresa, estrellas_tecnico, comentario }
```

### Historial de Dispositivo

- Timeline de cambios de estado del dispositivo
- Observaciones manuales con fecha y autor

### Ajustes de Cuenta

- Cambiar nombre, correo y contraseña
- Subpáginas: `CambiarCorreo.jsx`, `CambiarContrasena.jsx`

---

## Pagos con Wompi

El sistema integra [Wompi](https://comercios.wompi.co) como pasarela de pagos para que los usuarios puedan pagar el costo del mantenimiento de sus dispositivos directamente desde la plataforma.

### Flujo completo

```
1. Técnico registra costo al cambiar estado a "En Mantenimiento"
   → INSERT en mantenimiento con costo, estado_pago='Pendiente', referencia_pago='MANT-{id}'

2. Usuario ve botón "Pagar $X" en su Dashboard (columna Pago)
   → GET /api/pagos/datos/:dispositivoId devuelve monto, referencia y public_key

3. Usuario abre PagoMantenimiento.jsx
   → Se carga el widget de Wompi con los datos del pago

4. Usuario completa el pago en el widget de Wompi
   → POST /api/pagos/confirmar con { referencia, transaccion_id, estado_wompi: 'APPROVED' }
   → UPDATE mantenimiento SET estado_pago='Pagado', transaccion_id=..., fecha_pago=NOW()

5. Wompi también notifica por webhook (respaldo)
   → POST /api/pagos/webhook (ruta pública, sin autenticación)
   → Mismo UPDATE si el usuario cerró el navegador antes de confirmar
```

### Endpoints de pagos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/pagos/datos/:dispositivoId` | Devuelve monto, referencia, estado_pago y public_key de Wompi |
| `POST` | `/api/pagos/confirmar` | Confirma el pago tras aprobación del widget |
| `POST` | `/api/pagos/webhook` | Webhook público — Wompi notifica cambios de estado de transacción |

### Respuesta de `GET /api/pagos/datos/:dispositivoId`

```json
{
  "mantenimiento_id": 12,
  "monto": 75000,
  "referencia": "MANT-12",
  "descripcion": "Mantenimiento - Laptop HP (SN-001)",
  "public_key": "pub_test_XXXXXXXX",
  "estado_pago": "Pendiente"
}
```

Devuelve `404` si no hay mantenimiento activo, `400` si el costo es 0 o si ya fue pagado.

### Modelo de mantenimiento — campos de pago

```js
// MantenimientoModel.update() soporta los campos nuevos:
static async update(id, data) {
  const {
    descripcion, costo, estado_mantenimiento,
    tecnico_id, estado_pago, referencia_pago,
    transaccion_id,  // ← ID de transacción de Wompi
    fecha_pago       // ← Fecha en que se completó el pago
  } = data;
  // ...
}
```

### Variables de entorno requeridas

```env
WOMPI_PUBLIC_KEY=pub_test_XXXXXXXXXXXXXXXX   # llave pública (va al frontend vía API)
WOMPI_PRIVATE_KEY=prv_test_XXXXXXXXXXXXXXXX  # llave privada (solo backend)
```

Obtener las llaves en [comercios.wompi.co](https://comercios.wompi.co) → Desarrolladores. Las llaves `pub_test_` / `prv_test_` son de sandbox (sin cobros reales). Para producción usar `pub_prod_` / `prv_prod_`.

### Tarjetas de prueba (sandbox)

| Número | Resultado |
|---|---|
| `4242 4242 4242 4242` | Pago aprobado (APPROVED) |
| `4111 1111 1111 1111` | Pago rechazado (DECLINED) |

Cualquier fecha futura y CVC de 3 dígitos son válidos en sandbox.

---

## Correos automáticos

El servicio `email.service.js` envía correos HTML estilizados ante 4 eventos del ciclo de vida del dispositivo.

### Eventos

| Constante | Cuándo se dispara |
|---|---|
| `EVENTOS.REGISTRO` | Al crear un dispositivo nuevo |
| `EVENTOS.INICIO_MANTENIMIENTO` | Al cambiar estado a "En Mantenimiento" |
| `EVENTOS.FIN_MANTENIMIENTO` | Al cambiar estado a "Listo para Entrega" |
| `EVENTOS.SALIDA` | Al cambiar estado a "Entregado" o registrar fecha de salida |

### Flujo interno

1. El controlador de dispositivos llama `enviarCorreo({ destinatario, usuario_id, evento, datos })`
2. El servicio inserta el registro en la tabla `correos` de la BD (siempre, aunque el envío falle)
3. Envía el correo HTML por Gmail usando nodemailer
4. Los errores de envío se loguean pero no interrumpen la respuesta al cliente

```js
// Ejemplo de llamada desde el controlador
enviarCorreo({
  destinatario: usuario.correo,
  usuario_id: uid,
  evento: EVENTOS.INICIO_MANTENIMIENTO,
  datos: { nombre: disp.nombre, serial: disp.serial }
}).catch(e => console.error('Error correo:', e.message));
```

> El `transporter` de nodemailer se crea **dentro** de `enviarCorreo()` para leer `process.env` después de que dotenv ya cargó las variables. Si se crea en el módulo raíz, las variables aún no están disponibles al importar.

---

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

# Wompi — llaves de prueba (sandbox). Reemplaza con las tuyas desde comercios.wompi.co
WOMPI_PUBLIC_KEY=pub_test_XXXXXXXXXXXXXXXX
WOMPI_PRIVATE_KEY=prv_test_XXXXXXXXXXXXXXXX
```

> `EMAIL_PASS` debe ser una contraseña de aplicación de Gmail (no la contraseña normal de la cuenta).
> `WOMPI_PUBLIC_KEY` y `WOMPI_PRIVATE_KEY` se obtienen en [comercios.wompi.co](https://comercios.wompi.co) → Desarrolladores → Llaves de API.

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

### Reinicio del servidor tras cambios

Node.js carga los módulos en memoria al arrancar. Si se modifica un archivo del backend, el servidor debe reiniciarse para que los cambios surtan efecto. Sin reinicio, el proceso sigue ejecutando el código viejo en caché aunque el archivo en disco esté actualizado.

```bash
# Verificar proceso en puerto 5000
netstat -ano | findstr :5000

# Terminar proceso (Windows)
taskkill /PID <pid> /F

# Reiniciar
npm start
```

Para desarrollo, se recomienda usar `nodemon` para reinicio automático:

```bash
npm install -D nodemon
# En package.json scripts: "dev": "nodemon server.js"
npm run dev
```
