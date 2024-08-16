// config/db.js
const sql = require('mssql');
require('dotenv').config();  // Load environment variables from .env file

// Define the configuration for your SQL Server connection using environment variables
const config = {
    user: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,  
    server: process.env.DB_SERVER,  
    database: process.env.DB_NAME,  
    port: parseInt(process.env.DB_PORT, 10),  
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',  
        trustServerCertificate: true  
    }
};

// Function to connect to the database
async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to the database successfully!');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

module.exports = {
    connectToDatabase,
    sql
};
