const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'device_guard_db',
    port: process.env.DB_PORT || 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '-05:00'
});

module.exports = pool;
