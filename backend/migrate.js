const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function runMigration() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'device_guard_db',
        port: process.env.DB_PORT || 3307
    });

    try {
        console.log("Iniciando migración...");
        
        // Agregar columna a usuarios ignorando error si ya existe
        try {
            await pool.query('ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) DEFAULT 1');
            console.log("Columna 'activo' agregada a 'usuarios'");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("La columna 'activo' ya existe en 'usuarios'");
            else throw e;
        }

        // Agregar columna a dispositivos ignorando error si ya existe
        try {
            await pool.query('ALTER TABLE dispositivos ADD COLUMN activo TINYINT(1) DEFAULT 1');
            console.log("Columna 'activo' agregada a 'dispositivos'");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("La columna 'activo' ya existe en 'dispositivos'");
            else throw e;
        }

        // Actualizar todos los registros a activo = 1
        const [resUsers] = await pool.query('UPDATE usuarios SET activo = 1');
        console.log(`Usuarios actualizados: ${resUsers.affectedRows}`);
        
        const [resDevices] = await pool.query('UPDATE dispositivos SET activo = 1');
        console.log(`Dispositivos actualizados: ${resDevices.affectedRows}`);

        console.log("Migración completada con éxito.");
    } catch (error) {
        console.error("Error durante la migración:", error.message);
    } finally {
        await pool.end();
    }
}

runMigration();
