import express from "express";
import cors from "cors";
import { readdirSync } from "fs";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectToDatabase, sql } from "./config/db.js"; // Import the database connection

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Apply middlewares
app.use(cors());
app.use(express.json()); // to communicate with frontend with JSON
app.use(morgan("dev"));

// Function to load routes dynamically
async function loadRoutes() {
    const routeFiles = readdirSync("./routes");
    for (const file of routeFiles) {
        const route = await import(`./routes/${file}`);
        app.use("/api", route.default);
    }
}

// Connect to the database before setting up routes
connectToDatabase().then(async () => {
    // Load routes only after successful database connection
    await loadRoutes();

    // Listen on the port only after successful route loading
    const port = process.env.PORT || 8000;
    app.listen(port, () => console.log(`Server is running on port ${port}`));
}).catch(err => {
    console.error('Failed to start the server: ', err);
    process.exit(1); // Exit the application if the database connection fails
});

// Clean up the SQL connection pool when the server is stopped
process.on('SIGINT', () => {
    sql.close(() => {
        console.log('SQL connection pool closed.');
        process.exit(0);
    });
});