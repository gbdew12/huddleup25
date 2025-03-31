const express = require("express");
const mariadb = require("mariadb");
require('dotenv').config();
const app = express();

const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 5,
});

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

async function testConnection() {
    try {
        await query('SELECT 1 + 1 AS test');
        console.log('Database connection test successful');
    } catch (err) {
        console.error('Database connection test failed');
        throw err;
    }
}

async function startServer() {
    try {
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
