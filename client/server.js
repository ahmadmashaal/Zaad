import express from "express";
import { parse } from "url";
import next from "next";
import { createProxyMiddleware } from "http-proxy-middleware";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    // Log when the server receives a request
    server.use((req, res, next) => {
      console.log(`Frontend Server received: ${req.method} ${req.url}`);
      next();
    });

    // Apply proxy
    if (dev) {
      server.use(
        "/api",
        createProxyMiddleware({
          target: "http://localhost:8000",
          changeOrigin: true,
          logLevel: "debug", // Set to debug to see detailed logs
        })
      );
    }

    // Handle all other requests with Next.js
    server.all("*", (req, res) => {
      console.log(`Handling with Next.js: ${req.method} ${req.url}`);
      return handle(req, res);
    });

    // Start the server
    server.listen(3000, (err) => {
      if (err) {
        console.error("Failed to start server:", err);
      } else {
        console.log(`> Server ready on http://localhost:3000`);
      }
    });
  })
  .catch((err) => {
    console.error("Error starting server:", err);
  });
