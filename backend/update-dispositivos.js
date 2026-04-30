const pool = require('./src/database/connection');

// Mapa: marca + tipo => { modelo, descripcion }
const modelosPorMarcaTipo = {
  // Portátiles
  'Dell_Portatil':    { modelos: ['Latitude 5520', 'Inspiron 15', 'XPS 13'],           descripcion: 'Portátil de uso administrativo, teclado en buen estado.' },
  'HP_Portatil':      { modelos: ['ProBook 450', 'EliteBook 840', 'Pavilion 15'],       descripcion: 'Portátil corporativo, batería con desgaste moderado.' },
  'Lenovo_Portatil':  { modelos: ['ThinkPad E15', 'IdeaPad 3', 'ThinkBook 14'],         descripcion: 'Portátil robusto, bisagra con leve holgura.' },
  'Asus_Portatil':    { modelos: ['VivoBook 15', 'ZenBook 14', 'ExpertBook B1'],        descripcion: 'Portátil ligero, pantalla sin rayones.' },
  'Apple_Portatil':   { modelos: ['MacBook Air M1', 'MacBook Pro 13', 'MacBook Pro 14'], descripcion: 'Portátil Apple, cargador MagSafe incluido.' },
  // Computadoras
  'Dell_Computadora':    { modelos: ['OptiPlex 3080', 'OptiPlex 7090', 'Vostro 3681'],       descripcion: 'PC de escritorio, incluye teclado y mouse.' },
  'HP_Computadora':      { modelos: ['ProDesk 400 G7', 'EliteDesk 800', 'Slimline 290'],     descripcion: 'PC compacta, sin monitor asignado.' },
  'Lenovo_Computadora':  { modelos: ['ThinkCentre M70q', 'IdeaCentre 3', 'ThinkStation P340'], descripcion: 'Equipo de escritorio para uso en laboratorio.' },
  // Tablets
  'Samsung_Tablet': { modelos: ['Galaxy Tab S7', 'Galaxy Tab A8', 'Galaxy Tab S6 Lite'], descripcion: 'Tablet Android, funda protectora incluida.' },
  'Apple_Tablet':   { modelos: ['iPad 9na Gen', 'iPad Air 5', 'iPad Mini 6'],            descripcion: 'Tablet Apple, sin Apple Pencil.' },
  'Lenovo_Tablet':  { modelos: ['Tab M10 Plus', 'Tab P11', 'Tab M8'],                    descripcion: 'Tablet de uso educativo, pantalla en buen estado.' },
  // Pantallas
  'LG_Pantalla':      { modelos: ['27UK850-W', '24MK430H', '27GL850-B'], descripcion: 'Monitor Full HD, cable HDMI incluido.' },
  'Samsung_Pantalla': { modelos: ['S24F350', 'C27F396', 'S27A600'],      descripcion: 'Monitor con soporte ajustable, sin pixeles muertos.' },
  'Dell_Pantalla':    { modelos: ['P2422H', 'U2722D', 'S2421HN'],        descripcion: 'Monitor profesional, base con pivote.' },
  // Proyectores
  'Epson_Proyector':  { modelos: ['PowerLite 118', 'EB-X51', 'EH-TW750'], descripcion: 'Proyector de aula, lámpara con 800 horas de uso.' },
  'BenQ_Proyector':   { modelos: ['MX550', 'TH585', 'MW550'],              descripcion: 'Proyector DLP, control remoto incluido.' },
  'Optoma_Proyector': { modelos: ['HD143X', 'EH412', 'W400LVe'],           descripcion: 'Proyector Full HD, cable VGA y HDMI incluidos.' },
  // Impresoras
  'HP_Impresora':     { modelos: ['LaserJet Pro M404n', 'DeskJet 2775', 'OfficeJet Pro 9015'], descripcion: 'Impresora láser, tóner al 60%.' },
  'Epson_Impresora':  { modelos: ['EcoTank L3250', 'WorkForce WF-2850', 'L4260'],              descripcion: 'Impresora de tinta continua, tanques llenos.' },
  'Canon_Impresora':  { modelos: ['PIXMA G3160', 'imageCLASS MF445dw', 'PIXMA TR4520'],        descripcion: 'Impresora multifuncional, escáner operativo.' },
};

// Fallback por tipo cuando la marca no está en el mapa
const fallbackPorTipo = {
  'Portatil':    { modelos: ['Notebook Gen 1', 'Notebook Gen 2'], descripcion: 'Portátil de uso general.' },
  'Computadora': { modelos: ['Desktop Gen 1', 'Desktop Gen 2'],   descripcion: 'PC de escritorio de uso general.' },
  'Tablet':      { modelos: ['Tablet 10"', 'Tablet 8"'],          descripcion: 'Tablet de uso general.' },
  'Pantalla':    { modelos: ['Monitor 24"', 'Monitor 27"'],        descripcion: 'Monitor de uso general.' },
  'Proyector':   { modelos: ['Proyector HD', 'Proyector FHD'],     descripcion: 'Proyector de uso general.' },
  'Impresora':   { modelos: ['Impresora Laser', 'Impresora Tinta'], descripcion: 'Impresora de uso general.' },
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Genera una hora aleatoria realista en formato HH:MM:SS (entre 07:00 y 18:00)
const horaAleatoria = () => {
  const h = Math.floor(Math.random() * 11) + 7; // 7 a 17
  const m = Math.floor(Math.random() * 60);
  const s = Math.floor(Math.random() * 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

const update = async () => {
  try {
    console.log('🔄 Actualizando modelo, descripcion y hora_registro de dispositivos...');

    const [dispositivos] = await pool.query(
      'SELECT id, marca, tipo FROM dispositivos WHERE modelo IS NULL OR descripcion IS NULL OR hora_registro IS NULL'
    );

    if (dispositivos.length > 0) {
      console.log(`📋 Dispositivos a actualizar (modelo/desc/hora): ${dispositivos.length}`);
      for (const d of dispositivos) {
        const key   = `${d.marca}_${d.tipo}`;
        const entry = modelosPorMarcaTipo[key] || fallbackPorTipo[d.tipo] || { modelos: ['Modelo Generico'], descripcion: 'Sin descripcion disponible.' };
        const modelo      = pick(entry.modelos);
        const descripcion = entry.descripcion;
        const hora        = horaAleatoria();
        await pool.query(
          'UPDATE dispositivos SET modelo = ?, descripcion = ?, hora_registro = ? WHERE id = ?',
          [modelo, descripcion, hora, d.id]
        );
      }
      console.log(`✔ ${dispositivos.length} dispositivos actualizados (modelo/desc/hora).`);
    } else {
      console.log('✅ Todos los dispositivos ya tienen modelo, descripcion y hora_registro.');
    }

    // ── Actualizar ubicaciones con lugares de empresa de mantenimiento ──
    console.log('\n🏢 Actualizando ubicaciones...');
    const ubicaciones = [
      'Taller Principal',
      'Área de Diagnóstico',
      'Bodega de Repuestos',
      'Sala de Pruebas',
      'Recepción Técnica',
      'Área de Ensamble',
      'Zona de Entrega',
      'Almacén General',
      'Laboratorio Electrónico',
      'Área de Limpieza',
    ];
    const [todos] = await pool.query('SELECT id FROM dispositivos');
    for (const d of todos) {
      await pool.query(
        'UPDATE dispositivos SET ubicacion = ? WHERE id = ?',
        [pick(ubicaciones), d.id]
      );
    }
    console.log(`✔ ${todos.length} ubicaciones actualizadas.`);

    // ── Agregar fecha y hora de salida a dispositivos Listo para Entrega / Entregado ──
    console.log('\n📦 Actualizando fecha y hora de salida...');
    const [sinSalida] = await pool.query(
      `SELECT id, fecha_registro FROM dispositivos
       WHERE estado_id IN (
         SELECT id FROM estados WHERE nombre IN ('Listo para Entrega', 'Entregado')
       )
       AND (fecha_salida IS NULL OR hora_salida IS NULL)`
    );

    for (const d of sinSalida) {
      // fecha_salida = fecha_registro + entre 1 y 5 días
      const base = d.fecha_registro ? new Date(d.fecha_registro) : new Date();
      const diasExtra = Math.floor(Math.random() * 5) + 1;
      base.setDate(base.getDate() + diasExtra);
      const fecha_salida = base.toISOString().split('T')[0];
      const hora_salida  = horaAleatoria();
      await pool.query(
        'UPDATE dispositivos SET fecha_salida = ?, hora_salida = ? WHERE id = ?',
        [fecha_salida, hora_salida, d.id]
      );
    }
    console.log(`✔ ${sinSalida.length} dispositivos con fecha/hora de salida actualizados.`);

    console.log('\n🎉 Todo actualizado correctamente.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

update();
