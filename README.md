# DeviceGuard

Sistema web de gestión de dispositivos tecnológicos institucionales. Permite registrar, monitorear y controlar el ciclo de vida completo de equipos: desde su ingreso, mantenimiento, préstamos, pagos y entrega final.

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Módulos del sistema](#módulos-del-sistema)
- [Roles de usuario](#roles-de-usuario)
- [API REST — Endpoints](#api-rest--endpoints)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Despliegue con Docker](#despliegue-con-docker)
- [Scripts de datos](#scripts-de-datos)
- [Funcionalidades recientes](#funcionalidades-recientes)

---

## Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI principal |
| Vite | 7 | Bundler y dev server |
| React Router DOM | 7 | Navegación SPA |
| Axios | 1.x | Llamadas HTTP al backend |
| Recharts | 3.x | Gráficas y estadísticas |
| Bootstrap | 5.3 | Utilidades CSS base |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js + Express | 5.x | Servidor REST API |
| MySQL 2 | 3.x | Driver de base de datos |
| bcrypt | 6.x | Hash de contraseñas |
| Multer | 2.x | Subida de archivos/imágenes |
| Nodemailer | 8.x | Envío de correos |
| PDFKit | 0.18 | Generación de reportes PDF |
| ExcelJS | 4.x | Generación de reportes Excel |
| dotenv | 17.x | Variables de entorno |

### Infraestructura
- **MySQL 8.0** — Base de datos relacional
- **Docker + Docker Compose** — Contenedores para despliegue
- **Wompi** — Pasarela de pagos (widget JS oficial)

---

## Arquitectura del proyecto

```
proyecto_deviceguard/
├── backend/                    # API REST (Node.js + Express)
│   ├── src/
│   │   ├── controllers/        # Lógica de negocio por módulo
│   │   ├── models/             # Consultas SQL (patrón Repository)
│   │   ├── routes/             # Definición de endpoints
│   │   ├── middlewares/        # Auth, upload de archivos
│   │   ├── services/           # Servicio de email
│   │   ├── database/           # Pool de conexión MySQL
│   │   └── uploads/            # Imágenes subidas por usuarios
│   ├── server.js               # Entry point del servidor
│   ├── .env                    # Variables de entorno (no commitear)
│   ├── seed-data.js            # Datos de prueba iniciales
│   ├── fix-pagos-entregados.js # Script: poblar pagos de dispositivos Entregados
│   └── fix-pagos-pendientes.js # Script: corregir registros con costo=0
│
├── frontend/                   # SPA (React + Vite)
│   ├── src/
│   │   ├── pages/              # Vistas principales
│   │   ├── components/         # Componentes reutilizables
│   │   ├── context/            # ThemeContext, LanguageContext
│   │   ├── services/           # api.js (Axios)
│   │   └── assets/             # Íconos, animaciones
│   └── index.html
│
└── Docker/
    ├── docker-compose.yml
    ├── backend.Dockerfile
    └── frontend.Dockerfile
```

---

## Módulos del sistema

### 🏠 Dashboard (Inicio)
- Tarjetas de resumen: total equipos, listo para entrega, en revisión, en mantenimiento, entregados, total reportes.
- Tabla de dispositivos con filtro por estado y búsqueda por nombre/serial/ubicación.
- **Columna Pago** visible para todos los roles:
  - Rol `usuario`: botón "Pagar $X" (abre pasarela Wompi) o badge verde "Pagado".
  - Rol `admin`/`super_admin`/`tecnico`: badge de estado (Pagado / Pendiente) con monto.
- Lightbox para previsualizar imágenes de dispositivos.
- Paginación.

### 💻 Dispositivos
- CRUD completo de dispositivos (nombre, tipo, serial, marca, modelo, ubicación, descripción, imagen).
- Subida de imagen por dispositivo (máx. 5 MB).
- Filtro por estado, tipo y búsqueda libre.
- Historial de cambios por dispositivo.
- Papelera con restauración.

### 🔧 Gestión de Mantenimiento
- Lista dispositivos en estados: En Revisión, En Mantenimiento, Listo para Entrega.
- Cambio de estado con flujo controlado:
  - En Revisión → En Mantenimiento
  - En Mantenimiento → Listo para Entrega (abre modal para registrar costo)
  - Listo para Entrega → Entregado
- Modal de registro de costo: genera referencia de pago `MANT-{id}` y marca estado como Pendiente.
- Columna **Estado de Pago** con badges (Pagado / Pendiente).
- Filtro por estado (En Revisión, En Mantenimiento, Listo para Entrega).

### 💳 Pagos (Wompi)
- Integración con la pasarela **Wompi** mediante widget JS oficial.
- Flujo completo:
  1. Técnico registra costo → estado pago = `Pendiente`.
  2. Usuario abre modal de pago desde Dashboard.
  3. Widget Wompi se abre en overlay (scroll libre, z-index 999999).
  4. Tras aprobación: se confirma vía `POST /api/pagos/confirmar`.
  5. Webhook de respaldo: `POST /api/pagos/webhook`.
- Campos almacenados: `costo`, `referencia_pago`, `transaccion_id`, `fecha_pago`, `estado_pago`.
- Estados posibles: `Pendiente`, `Pagado`, `Rechazado`.

### 📋 Mantenimiento (CRUD)
- Registro y edición de mantenimientos.
- Tabla con columnas: dispositivo, descripción, costo (formato COP), fechas inicio/fin, estado mantenimiento, **estado pago** (badge con colores).
- Estados de mantenimiento: Pendiente, En Proceso, Completado, Cancelado.

### 📊 Estadísticas
- Gráficas de dispositivos por estado, tipo y ubicación.
- Historial de mantenimientos por período.
- Responsive con breakpoints para móvil y tablet.

### 📁 Reportes
- Generación de reportes en **PDF** y **Excel**.
- Filtros por rango de fechas, estado y tipo.
- Reportes de dispositivos, usuarios y base de datos.

### 👥 Equipo
- Lista de usuarios en tarjetas (avatar con iniciales, rol, correo).
- Tabla con búsqueda, paginación y acciones (editar, suspender/activar).
- Modal para agregar nuevo usuario con campos: nombre, apellido, correo, teléfono, puesto, género, rol, contraseña.
- Modal de edición de usuario.
- Badges de rol: Super Admin, Administrador, Técnico, Usuario.
- **Responsive completo**:
  - Tablet (≤768px): cards en 2 columnas, tabla con scroll horizontal.
  - Móvil (≤480px): tabla convertida a tarjetas con `data-label`, botones compactos con texto visible.

### 📧 Correo
- Mensajería interna entre usuarios.
- Envío de correos reales vía Nodemailer.
- Bandeja de entrada con filtros.

### 📅 Calendario
- Vista de eventos y mantenimientos programados.
- Responsive.

### 🔄 Registrar Salida
- Registro de salida de dispositivos con costo de mantenimiento.
- Genera referencia de pago automáticamente.

### 📦 Préstamos
- Registro de préstamos de dispositivos a usuarios.
- Control de fechas de entrega y devolución.

### ⭐ Calificaciones
- Sistema de calificación del servicio de mantenimiento.

### 🗑️ Papelera
- Dispositivos eliminados con opción de restaurar.
- Eliminación permanente.

### ⚙️ Ajustes de Cuenta
- Cambio de contraseña.
- Cambio de correo electrónico.
- Preferencias de tema (claro/oscuro) e idioma (ES/EN).

---

## Roles de usuario

| Rol | Descripción | Permisos principales |
|---|---|---|
| `super_admin` | Administrador total | Acceso completo a todos los módulos, ve columna "Registrado por" |
| `admin` | Administrador | Gestión de dispositivos, mantenimiento, equipo y reportes |
| `tecnico` | Técnico | Ve sus dispositivos asignados, cambia estados, registra costos |
| `usuario` | Usuario final | Ve sus propios dispositivos, puede realizar pagos desde Dashboard |

---

## API REST — Endpoints

### Usuarios — `/api/usuarios`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar todos los usuarios |
| POST | `/` | Crear usuario |
| PUT | `/:id` | Actualizar usuario |
| DELETE | `/:id` | Eliminar usuario |
| PATCH | `/:id/toggle-status` | Activar / suspender usuario |

### Dispositivos — `/api/dispositivos`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar dispositivos |
| GET | `/:id` | Obtener dispositivo por ID |
| POST | `/` | Crear dispositivo (con imagen) |
| PUT | `/:id` | Actualizar dispositivo |
| DELETE | `/:id` | Mover a papelera |

### Mantenimiento — `/api/mantenimiento`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar mantenimientos |
| GET | `/:id` | Obtener por ID |
| POST | `/` | Crear mantenimiento |
| PUT | `/:id` | Actualizar mantenimiento |
| DELETE | `/:id` | Eliminar mantenimiento |
| POST | `/costo` | Registrar costo (crea o actualiza mantenimiento activo) |

### Pagos — `/api/pagos`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/datos/:dispositivoId` | Obtener datos de pago del mantenimiento más reciente |
| POST | `/confirmar` | Confirmar pago aprobado por Wompi |
| POST | `/webhook` | Webhook de Wompi (ruta pública) |

### Reportes — `/api/reportes`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/total` | Total de mantenimientos |
| GET | `/pdf` | Generar reporte PDF |
| GET | `/excel` | Generar reporte Excel |

### Correo — `/api/correo`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar correos del usuario |
| POST | `/` | Enviar correo interno |

### Historial — `/api/historial`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/:dispositivoId` | Historial de cambios de un dispositivo |

### Calificaciones — `/api/calificaciones`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar calificaciones |
| POST | `/` | Crear calificación |

### Préstamos — `/api/prestamos`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar préstamos |
| POST | `/` | Registrar préstamo |
| PUT | `/:id` | Actualizar préstamo |

---

# Nodemailer (correo)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password
```

---

## Instalación y ejecución local

### Requisitos previos
- Node.js ≥ 18
- MySQL 8.0
- npm ≥ 9

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd proyecto_deviceguard
```

### 2. Configurar el backend
```bash
cd backend
npm install
# Crear y configurar backend/.env con tus credenciales
node server.js
```

El servidor queda disponible en `http://localhost:5000`.

### 3. Configurar el frontend
```bash
cd frontend
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

### 4. Poblar la base de datos (opcional)
```bash
cd backend

# Datos de prueba completos (usuarios, dispositivos, mantenimientos)
node seed-data.js

# Poblar pagos para dispositivos en estado "Entregado"
node fix-pagos-entregados.js
```

---

## Despliegue con Docker

```bash
cd Docker
docker compose up --build
```

| Servicio | Puerto local | Descripción |
|---|---|---|
| `db` | 3308 | MySQL 8.0 |
| `backend` | 6500 | API REST |
| `frontend` | 5173 | App React |

Para detener:
```bash
docker compose down
```

Para detener y eliminar volúmenes (borra la BD):
```bash
docker compose down -v
```

---

## Scripts de datos

| Script | Descripción |
|---|---|
| `seed-data.js` | Crea 1 super_admin, 25 técnicos, 39 usuarios y 100 dispositivos con datos realistas |
| `seed-correos.js` | Genera correos internos de prueba |
| `fix-pagos-entregados.js` | Actualiza/crea registros de mantenimiento con datos de pago para todos los dispositivos en estado "Entregado" |
| `fix-pagos-pendientes.js` | Corrige registros con `costo = 0` o `estado_pago != Pagado` para dispositivos Entregados |
| `migrate.js` | Migraciones de esquema de BD |
| `migrate-passwords.js` | Re-hashea contraseñas en texto plano a bcrypt |
| `update-dispositivos.js` | Actualización masiva de campos en dispositivos |
| `asignar-entregado-test.js` | Asigna un dispositivo Entregado a un usuario específico para pruebas |

---

## Funcionalidades recientes

### Módulo de Pagos con Wompi
- Integración completa con la pasarela de pagos Wompi mediante su widget JS oficial.
- El modal de pago se abre como overlay sin cambiar de ruta (componente `PagoMantenimientoModal`).
- Cuando Wompi está activo, el `overflow: hidden` del body se libera para permitir scroll dentro del widget.
- El backdrop de la app se desmonta completamente mientras Wompi está abierto (evita conflictos de z-index).
- Webhook de respaldo para confirmar pagos aunque el usuario cierre el navegador.

### Columna de Pago en Dashboard
- Visible para todos los roles (antes solo para `usuario`).
- Muestra badge verde "Pagado" + monto para dispositivos en estado "Listo para Entrega" y "Entregado".
- Muestra badge amarillo "Pendiente" + monto para admin/técnico.
- Solo el rol `usuario` ve el botón de pagar.

### Datos de pago para dispositivos Entregados
- `findActivoByDispositivo` ahora prioriza `En Proceso` → `Completado`, permitiendo mostrar datos de pago de dispositivos ya entregados.
- `getDatosPago` devuelve los datos del pago completado en lugar de error 400 cuando `estado_pago = 'Pagado'`.

### Columna Estado Pago en Mantenimiento
- La tabla del módulo Mantenimiento ahora incluye columna "Estado Pago" con badges de colores: verde (Pagado), rojo (Rechazado), amarillo (Pendiente).
- El costo se formatea en COP en lugar de mostrar el número crudo.

### Responsive — Módulo Equipo
- Tabla convertida a tarjetas en móvil (≤480px) usando `data-label`.
- Botones "Editar" y "Suspender" visibles con texto completo en móvil, tamaño compacto con `flex: 0 0 auto`.
- Cards de usuarios en 2 columnas desde tablet.
- Modal de formulario en columna única en móvil, inputs con `font-size: 16px` para evitar zoom en iOS.

### Scripts de migración de datos
- `fix-pagos-entregados.js`: pobla automáticamente los campos de pago (`costo`, `referencia_pago`, `transaccion_id`, `fecha_pago`, `estado_pago = 'Pagado'`) para todos los dispositivos en estado "Entregado" que no tenían datos de pago.
- `fix-pagos-pendientes.js`: corrige registros que quedaron con `costo = 0` tras la primera migración.

---

## Credenciales de prueba (seed)

Todos los usuarios generados por `seed-data.js` tienen contraseña: **`123456`**

| Rol | Correo de ejemplo |
|---|---|
| Super Admin | `andres.morales@deviceguard.com` |
| Técnico | `carlos.ramirez@deviceguard.com` |
| Usuario | `maria.fernanda.lopez@gmail.com` |
| Usuario (con dispositivo Entregado) | `ana.sofia.martinez@gmail.com` |

---

*DeviceGuard — Sistema de Gestión de Dispositivos Tecnológicos*
