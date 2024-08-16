import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_SERVER,
    dialect: 'mssql',
    port: parseInt(process.env.DB_PORT, 10),
    dialectOptions: {
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        },
    },
    define: {
        timestamps: false,
    },
});

export async function connectToDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database successfully using Sequelize!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
}

export { sequelize as sql };
