const pool = require('./src/database/connection');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    console.log("🚀 Iniciando seed...");

    const password = await bcrypt.hash("123456", 10);

    // 🧹 Limpiar tablas en orden por FK
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    await pool.query("DELETE FROM historial_dispositivos");
    await pool.query("DELETE FROM mantenimiento");
    await pool.query("DELETE FROM prestamos");
    await pool.query("DELETE FROM mensajes_internos");
    await pool.query("DELETE FROM correos");
    await pool.query("DELETE FROM dispositivos");
    await pool.query("DELETE FROM usuarios");
    await pool.query("ALTER TABLE usuarios AUTO_INCREMENT = 1");
    await pool.query("ALTER TABLE dispositivos AUTO_INCREMENT = 1");
    await pool.query("ALTER TABLE mantenimiento AUTO_INCREMENT = 1");
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    // 👤 SUPER ADMIN (id = 1)
    await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, 'super_admin')`,
      ['Andres Morales', 'andres.morales@deviceguard.com', password]
    );

    // 🔧 TECNICOS (ids 2–26, total 25)
    const nombresTecnicos = [
      'Carlos Ramirez',    'Luis Fernando Perez', 'Jorge Andres Torres',  'Miguel Angel Vargas', 'David Hernandez',
      'Sebastian Gomez',   'Felipe Castillo',      'Alejandro Rios',       'Juan Pablo Mendez',   'Nicolas Salazar',
      'Andres Felipe Ruiz','Diego Alejandro Mora', 'Camilo Suarez',        'Santiago Jimenez',    'Ivan Dario Ospina',
      'Cristian Muñoz',    'Fabian Cardona',       'Esteban Guerrero',     'Mauricio Pinto',      'Ricardo Leon',
      'Hector Bermudez',   'Oscar Medina',         'Jhon Jairo Acosta',    'William Rojas',       'Ernesto Fuentes'
    ];
    for (let i = 0; i < 25; i++) {
      const nombre = nombresTecnicos[i];
      const correo = nombre.toLowerCase().replace(/ /g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '') + `@deviceguard.com`;
      await pool.query(
        `INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, 'tecnico')`,
        [nombre, correo, password]
      );
    }

    // 👥 USUARIOS (ids 27–65, total 39)
    const nombresUsuarios = [
      'Maria Fernanda Lopez',  'Ana Sofia Martinez',   'Laura Valentina Cruz',  'Daniela Paola Herrera', 'Valentina Reyes',
      'Isabella Moreno',       'Natalia Gutierrez',    'Paola Andrea Vargas',   'Juliana Castillo',      'Alejandra Rios',
      'Monica Patricia Diaz',  'Sandra Milena Perez',  'Gloria Esperanza Ruiz', 'Claudia Marcela Torres','Adriana Gomez',
      'Roberto Carlos Suarez', 'Andres Camilo Jimenez','Pablo Esteban Mendez',  'Gabriel Alejandro Mora','Sergio Andres Pinto',
      'Fernando Augusto Leon', 'Gustavo Adolfo Rojas', 'Raul Eduardo Ospina',   'Jaime Alberto Cardona', 'Cesar Augusto Muñoz',
      'Luz Marina Salazar',    'Martha Cecilia Acosta','Rosa Elena Guerrero',   'Carmen Alicia Medina',  'Esperanza Fuentes',
      'Jorge Luis Bermudez',   'Manuel Antonio Rios',  'Pedro Pablo Vargas',    'Luis Carlos Herrera',   'Jose Miguel Torres',
      'Diana Carolina Ruiz',   'Yesenia Paola Gomez',  'Leidy Johana Castillo', 'Fredy Alexander Mora'
    ];
    for (let i = 0; i < 39; i++) {
      const nombre = nombresUsuarios[i];
      const correo = nombre.toLowerCase().replace(/ /g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '') + `@gmail.com`;
      await pool.query(
        `INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, 'usuario')`,
        [nombre, correo, password]
      );
    }

    console.log("✔ Usuarios creados (1 admin, 25 técnicos, 39 usuarios)");

    // Obtener IDs reales de usuarios para asignar a dispositivos
    const [usuariosRows] = await pool.query("SELECT id FROM usuarios WHERE rol = 'usuario'");
    const usuarioIds = usuariosRows.map(r => r.id);

    // 💻 DISPOSITIVOS (100) con datos realistas
    // estados: 1=En Revision, 2=En Mantenimiento, 3=Listo para Entrega, 4=Entregado
    const estadoIds = [1, 2, 3, 4];
    const ubicaciones = ['Laboratorio 1', 'Almacen Central', 'Sotano', 'Recepcion', 'Biblioteca', 'Nave 6', 'Sala de Computo', 'Oficina Administrativa'];

    // Catálogo de dispositivos realistas por tipo
    const catalogo = [
      // Portátiles
      { tipo: 'Portatil', marca: 'Dell',   modelos: ['Latitude 5520', 'Inspiron 15', 'XPS 13'],          descripcion: 'Portátil de uso administrativo, teclado en buen estado.' },
      { tipo: 'Portatil', marca: 'HP',     modelos: ['ProBook 450', 'EliteBook 840', 'Pavilion 15'],      descripcion: 'Portátil corporativo, batería con desgaste moderado.' },
      { tipo: 'Portatil', marca: 'Lenovo', modelos: ['ThinkPad E15', 'IdeaPad 3', 'ThinkBook 14'],        descripcion: 'Portátil robusto, bisagra con leve holgura.' },
      { tipo: 'Portatil', marca: 'Asus',   modelos: ['VivoBook 15', 'ZenBook 14', 'ExpertBook B1'],       descripcion: 'Portátil ligero, pantalla sin rayones.' },
      { tipo: 'Portatil', marca: 'Apple',  modelos: ['MacBook Air M1', 'MacBook Pro 13', 'MacBook Pro 14'], descripcion: 'Portátil Apple, cargador MagSafe incluido.' },
      // Computadoras de escritorio
      { tipo: 'Computadora', marca: 'Dell',   modelos: ['OptiPlex 3080', 'OptiPlex 7090', 'Vostro 3681'], descripcion: 'PC de escritorio, incluye teclado y mouse.' },
      { tipo: 'Computadora', marca: 'HP',     modelos: ['ProDesk 400 G7', 'EliteDesk 800', 'Slimline 290'], descripcion: 'PC compacta, sin monitor asignado.' },
      { tipo: 'Computadora', marca: 'Lenovo', modelos: ['ThinkCentre M70q', 'IdeaCentre 3', 'ThinkStation P340'], descripcion: 'Equipo de escritorio para uso en laboratorio.' },
      // Tablets
      { tipo: 'Tablet', marca: 'Samsung', modelos: ['Galaxy Tab S7', 'Galaxy Tab A8', 'Galaxy Tab S6 Lite'], descripcion: 'Tablet Android, funda protectora incluida.' },
      { tipo: 'Tablet', marca: 'Apple',   modelos: ['iPad 9na Gen', 'iPad Air 5', 'iPad Mini 6'],           descripcion: 'Tablet Apple, sin Apple Pencil.' },
      { tipo: 'Tablet', marca: 'Lenovo',  modelos: ['Tab M10 Plus', 'Tab P11', 'Tab M8'],                   descripcion: 'Tablet de uso educativo, pantalla en buen estado.' },
      // Pantallas / Monitores
      { tipo: 'Pantalla', marca: 'LG',      modelos: ['27UK850-W', '24MK430H', '27GL850-B'],  descripcion: 'Monitor Full HD, cable HDMI incluido.' },
      { tipo: 'Pantalla', marca: 'Samsung', modelos: ['S24F350', 'C27F396', 'S27A600'],        descripcion: 'Monitor con soporte ajustable, sin pixeles muertos.' },
      { tipo: 'Pantalla', marca: 'Dell',    modelos: ['P2422H', 'U2722D', 'S2421HN'],          descripcion: 'Monitor profesional, base con pivote.' },
      // Proyectores
      { tipo: 'Proyector', marca: 'Epson',  modelos: ['PowerLite 118', 'EB-X51', 'EH-TW750'],  descripcion: 'Proyector de aula, lámpara con 800 horas de uso.' },
      { tipo: 'Proyector', marca: 'BenQ',   modelos: ['MX550', 'TH585', 'MW550'],               descripcion: 'Proyector DLP, control remoto incluido.' },
      { tipo: 'Proyector', marca: 'Optoma', modelos: ['HD143X', 'EH412', 'W400LVe'],            descripcion: 'Proyector Full HD, cable VGA y HDMI incluidos.' },
      // Impresoras
      { tipo: 'Impresora', marca: 'HP',     modelos: ['LaserJet Pro M404n', 'DeskJet 2775', 'OfficeJet Pro 9015'], descripcion: 'Impresora láser, tóner al 60%.' },
      { tipo: 'Impresora', marca: 'Epson',  modelos: ['EcoTank L3250', 'WorkForce WF-2850', 'L4260'],              descripcion: 'Impresora de tinta continua, tanques llenos.' },
      { tipo: 'Impresora', marca: 'Canon',  modelos: ['PIXMA G3160', 'imageCLASS MF445dw', 'PIXMA TR4520'],        descripcion: 'Impresora multifuncional, escáner operativo.' },
    ];

    for (let i = 1; i <= 100; i++) {
      const usuario_id = usuarioIds[Math.floor(Math.random() * usuarioIds.length)];
      const estado_id  = estadoIds[Math.floor(Math.random() * estadoIds.length)];
      const ubicacion  = ubicaciones[Math.floor(Math.random() * ubicaciones.length)];

      // Elegir entrada del catálogo
      const cat    = catalogo[Math.floor(Math.random() * catalogo.length)];
      const modelo = cat.modelos[Math.floor(Math.random() * cat.modelos.length)];
      const nombre = `${cat.marca} ${modelo}`;
      const serial = `SN-${cat.tipo.substring(0,3).toUpperCase()}-${String(1000 + i).padStart(5, '0')}`;

      // Hora aleatoria entre 07:00 y 18:00
      const h = Math.floor(Math.random() * 11) + 7;
      const m = Math.floor(Math.random() * 60);
      const s = Math.floor(Math.random() * 60);
      const hora_registro = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

      await pool.query(
        `INSERT INTO dispositivos (nombre, tipo, serial, marca, modelo, ubicacion, descripcion, hora_registro, estado_id, usuario_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, cat.tipo, serial, cat.marca, modelo, ubicacion, cat.descripcion, hora_registro, estado_id, usuario_id]
      );
    }

    console.log("✔ Dispositivos creados (100)");

    // Obtener IDs reales de técnicos y dispositivos
    const [tecnicosRows] = await pool.query("SELECT id FROM usuarios WHERE rol = 'tecnico'");
    const tecnicoIds = tecnicosRows.map(r => r.id);

    const [dispositivosRows] = await pool.query("SELECT id FROM dispositivos");
    const dispositivoIds = dispositivosRows.map(r => r.id);

    // 🔧 MANTENIMIENTOS (60)
    // estado_mantenimiento ENUM: 'Pendiente','En Proceso','Completado','Cancelado'
    const estadosMant = ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'];

    for (let i = 0; i < 60; i++) {
      const dispositivo_id = dispositivoIds[Math.floor(Math.random() * dispositivoIds.length)];
      const tecnico_id = tecnicoIds[Math.floor(Math.random() * tecnicoIds.length)];
      const estado_mantenimiento = estadosMant[Math.floor(Math.random() * estadosMant.length)];

      await pool.query(
        `INSERT INTO mantenimiento (dispositivo_id, descripcion, estado_mantenimiento, tecnico_id)
         VALUES (?, ?, ?, ?)`,
        [
          dispositivo_id,
          `Mantenimiento del dispositivo ${dispositivo_id} - revision general`,
          estado_mantenimiento,
          tecnico_id
        ]
      );
    }

    console.log("✔ Mantenimientos creados (60)");
    console.log("🎉 Seed completado exitosamente");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error en seed:", error.message);
    process.exit(1);
  }
};

seed();
