//these are the inports 
const express = require("express");
const mariadb = require("mariadb");
const path = require('path')
require('dotenv').config();
const app = express();

//This generates the connection to our database 
//if the code is crashing make sure that the .env file exist if not you gotta make a new one using the group credentials
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 5,
});

//This code is just to tell node that we are using handlebars, and where to find the css files
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.set('view engine', 'hbs');

//This is the function for a query to our database
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
//Made this when I was crashing out, it just makes sure we connect to our database on startup
//We can remove it if ya'll want but it's helpful
async function testConnection() {
    try {
        await query('SELECT 1 + 1 AS test');
        console.log('Database connection test successful');
    } catch (err) {
        console.error('Database connection test failed');
        throw err;
    }
}

//This just starts the server 
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
        process.exit(1); 
    }
}

// Routes are hosted in the pages.js file go there to mess with them
app.use("/", require('./routes/pages'));


// Start the server
startServer();
