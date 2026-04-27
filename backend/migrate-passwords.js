/**
 * Script de migración: hashea las contraseñas en texto plano existentes en la BD.
 * Ejecutar UNA SOLA VEZ con: node migrate-passwords.js
 *
 * - Detecta automáticamente si una contraseña ya es un hash bcrypt ($2b$...) y la omite.
 * - Muestra un resumen al finalizar.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function migrar() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('✔  Conectado a la base de datos.\n');

  const [usuarios] = await db.query('SELECT id, nombre, contrasena FROM usuarios');

  let migrados = 0;
  let omitidos = 0;

  for (const usuario of usuarios) {
    const yaEsHash = usuario.contrasena && usuario.contrasena.startsWith('$2');

    if (yaEsHash) {
      console.log(`  ⏭  [${usuario.id}] ${usuario.nombre} — ya tiene hash, omitido.`);
      omitidos++;
      continue;
    }

    const hash = await bcrypt.hash(usuario.contrasena, SALT_ROUNDS);
    await db.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hash, usuario.id]);
    console.log(`  ✔  [${usuario.id}] ${usuario.nombre} — contraseña hasheada.`);
    migrados++;
  }

  await db.end();

  console.log(`\n─────────────────────────────────`);
  console.log(`  Migración completada.`);
  console.log(`  Hasheados : ${migrados}`);
  console.log(`  Omitidos  : ${omitidos}`);
  console.log(`─────────────────────────────────`);
}

migrar().catch(err => {
  console.error('Error durante la migración:', err.message);
  process.exit(1);
});
