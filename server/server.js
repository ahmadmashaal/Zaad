import express from "express";
import cors from "cors";
import { readdirSync } from "fs";
import morgan from "morgan";
import dotenv from "dotenv";
import csrf from "csrf";
import cookieParser from "cookie-parser";

import { connectToDatabase, sql } from "./config/db.js";

// Load environment variables
dotenv.config();

// Create an instance of the CSRF package, which will be used to generate tokens.
const csrfProtection = new csrf();

// Create express app
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',  // Our frontend URL
  credentials: true,  // Allow credentials (cookies, authorization headers, etc.)
};

// Apply middlewares
app.use(cors(corsOptions));
app.use(express.json()); // to communicate with frontend with JSON
app.use(morgan("dev")); // Log HTTP requests
app.use(cookieParser()); // to parse cookies attached to the client request

// Function to load routes dynamically
async function loadRoutes() {
  const routeFiles = readdirSync("./routes");
  for (const file of routeFiles) {
    const route = await import(`./routes/${file}`);
    app.use("/api", route.default);
  }
}

// CSRF token endpoint - This needs to be placed before your routes are registered.
app.get("/api/csrf-token", (req, res) => {
  // Generate a CSRF secret if it doesn't exist in cookies
  let csrfSecret = req.cookies._csrf;
  if (!csrfSecret) {
    csrfSecret = csrfProtection.secretSync();
    res.cookie('_csrf', csrfSecret); // Store the secret in a cookie for future use
  }

  // Generate a CSRF token using the secret
  const csrfToken = csrfProtection.create(csrfSecret);
  res.cookie('XSRF-TOKEN', csrfToken); // Send the CSRF token to the client in a cookie

  // Send the CSRF token in the response body for client-side use
  res.json({ csrfToken });
});

// Connect to the database before setting up routes
connectToDatabase()
  .then(async () => {
    // Load routes only after successful database connection
    await loadRoutes();

    // Apply the CSRF protection middleware
    app.use((req, res, next) => {
      const token = req.cookies['XSRF-TOKEN'];
      if (!token || !csrfProtection.verify(req.cookies._csrf, token)) {
        return res.status(403).json({ message: "Invalid CSRF token" });
      }
      next();
    });

    // Listen on the port only after successful route loading
    const port = process.env.PORT || 8000;
    app.listen(port, () => console.log(`Server is running on port ${port}`));
  })
  .catch((err) => {
    console.error("Failed to start the server: ", err);
    process.exit(1); // Exit the application if the database connection fails
  });

// Clean up the SQL connection pool when the server is stopped
process.on("SIGINT", () => {
  sql.close(() => {
    console.log("SQL connection pool closed.");
    process.exit(0);
  });
});
