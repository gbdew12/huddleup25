const express = require("express");
const mariadb = require("mariadb");
require('dotenv').config();
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const app = express();

// 1. Enhanced SSH Tunnel with Debug Logs
/*async function createTunnel() {
    try {
        console.log('Attempting SSH connection to:', process.env.SSH_HOST);
        await ssh.connect({
            host: process.env.SSH_HOST, 
            username: process.env.SSH_USER,
            password: process.env.SSH_PASSWORD, // Fixed typo (was SHH_PASSWORD)
            port: 22
        });
        console.log('SSH connected. Creating tunnel...');
        
        const tunnel = await ssh.forwardOut(
            '127.0.0.1', 12345, 
            '127.0.0.1', 3306
        );
        console.log('SSH tunnel established on port 12345');
        return tunnel;
    } catch (err) {
        console.error('SSH Tunnel Failed:', {
            message: err.message,
            host: process.env.SSH_HOST,
            user: process.env.SSH_USER,
            code: err.code  // Shows specific error code (e.g., ECONNREFUSED)
        });
        throw err;
    }
}*/

// 👇 2. Database Pool with Connection Diagnostics
const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 5,
    // 👇 Enhanced timeout settings
    connectTimeout: 15000, // 15s instead of default 10s
    acquireTimeout: 15000
});

// 👇 3. Query Wrapper with Full Error Context
async function query(sql, params) {
    let conn;
    try {
        console.log('Acquiring DB connection for query:', sql);
        conn = await pool.getConnection();
        const result = await conn.query(sql, params);
        return result;
    } catch (err) {
        console.error('Database Query Failed:', {
            sql: sql,
            params: params,
            errno: err.errno, //MariaDB error code
            sqlState: err.sqlState,
            fatal: err.fatal,
            stack: err.stack
        });
        throw err;
    } finally {
        if (conn) {
            console.log('Releasing connection');
            conn.release(); 
        }
    }
}

// 👇 4. Verify DB Connection on Startup
async function testConnection() {
    try {
        await query('SELECT 1 + 1 AS test');
        console.log('Database connection test successful');
    } catch (err) {
        console.error('Database connection test failed');
        throw err;
    }
}

// 👇 5. Startup Sequence with Error Handling
async function startServer() {
    try {
        //await createTunnel(); //Only needed if using SSH tunnel
        await testConnection();
        
        app.listen(3000, () => {
            console.log("Server started on Port 3000");
        });
    } catch (err) {
        console.error('Startup Failed:', {
            error: err.message,
            stack: err.stack
        });
        process.exit(1); // 👈 Exit with error code
    }
}

// Routes
app.get("/", (req, res) => { 
    res.send("<h1>Home Page</h1>")
});

// Start the server
startServer();
