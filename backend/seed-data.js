const pool = require('./database/conecction');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    console.log("🚀 Iniciando seed...");

    // 🔐 contraseña base
    const password = await bcrypt.hash("123456", 10);

    // 🧹 LIMPIAR TABLAS (opcional)
    await pool.query("DELETE FROM mantenimiento");
    await pool.query("DELETE FROM dispositivos");
    await pool.query("DELETE FROM usuarios");

    // 👤 SUPER ADMIN
    await pool.query(`
      INSERT INTO usuarios (nombre, correo, contraseña, rol)
      VALUES ('Admin Principal', 'admin@mail.com', ?, 'super_admin')
    `, [password]);

    // 🔧 TECNICOS (25)
    for (let i = 1; i <= 25; i++) {
      await pool.query(`
        INSERT INTO usuarios (nombre, correo, contraseña, rol)
        VALUES (?, ?, ?, 'tecnico')
      `, [`Tecnico ${i}`, `tecnico${i}@mail.com`, password]);
    }

    // 👥 USUARIOS (39)
    for (let i = 1; i <= 39; i++) {
      await pool.query(`
        INSERT INTO usuarios (nombre, correo, contraseña, rol)
        VALUES (?, ?, ?, 'usuario')
      `, [`Usuario ${i}`, `usuario${i}@mail.com`, password]);
    }

    console.log("✔ Usuarios creados");

    // 💻 DISPOSITIVOS (100)
    const estados = [
      "En Revision",
      "En Mantenimiento",
      "Listo para Entrega",
      "Entregado"
    ];

    for (let i = 1; i <= 100; i++) {
      const usuario_id = Math.floor(Math.random() * 39) + 27; 
      // usuarios empiezan después de admin + técnicos (1 + 25)

      const estado = estados[Math.floor(Math.random() * estados.length)];

      await pool.query(`
        INSERT INTO dispositivos (nombre, serial, estado, usuario_id)
        VALUES (?, ?, ?, ?)
      `, [
        `Dispositivo ${i}`,
        `SERIAL${1000 + i}`,
        estado,
        usuario_id
      ]);
    }

    console.log("✔ Dispositivos creados");

    // 🔧 MANTENIMIENTOS (para algunos dispositivos)
    for (let i = 1; i <= 60; i++) {
      const dispositivo_id = Math.floor(Math.random() * 100) + 1;
      const tecnico_id = Math.floor(Math.random() * 25) + 2; 
      // técnicos empiezan en id 2

      const estado = Math.random() > 0.5 ? "En Proceso" : "Completado";

      await pool.query(`
        INSERT INTO mantenimiento (dispositivo_id, descripcion, estado_mantenimiento, tecnico_id)
        VALUES (?, ?, ?, ?)
      `, [
        dispositivo_id,
        `Mantenimiento del dispositivo ${dispositivo_id}`,
        estado,
        tecnico_id
      ]);
    }

    console.log("✔ Mantenimientos creados");

    console.log("🎉 Datos de prueba listos");

  } catch (error) {
    console.error(error);
  }
};

seed();