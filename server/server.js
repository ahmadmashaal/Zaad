import express from "express";
import cors from "cors";
import {readdirSync} from "fs";
const morgan = require("morgan");
require("dotenv").config();

const {connectToDatabase, sql} = require('./config/db') // Import the database connection

// Create express app
const app = express();

// Apply middlewares
app.use(cors());
app.use(express.json()); //to communicate with frontend with JSON
app.use(morgan("dev"));

// Connect to the database before seeting up routes
connectToDatabase().then(pool => {
    // Once connected to the database, load routes
    readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

    // Listen on the port only after successful database connection
    const port = process.env.PORT || 8000;
    app.listen(port, () => console.log(`Server is running on port ${port}`));
}).catch(err => {
    console.error('Failed ti start the server: ', err);
    process.exit(1); //Exit the application if the database connection fails
});

// Clean up the SQL connection pool when the server is stopped
process.on('SIGINT', () =>{
    sql.close(() => {
        console.log('SQL connection pool closed.');
        process.exit(0);
    });
});