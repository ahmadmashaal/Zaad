import express from "express";
import { parse } from 'url'
import next from 'next'
import { createProxyMiddleware } from "http-proxy-middleware";

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
app
  .prepare()
  .then(() => {
    const server = express();
    // Apply proxy in dev mode
    if (dev) {
      server.use(
        "/api",
        createProxyMiddleware({
          target: "http://localhost:8000",
          changeOrigin: true,
        })
      );
    }
    server.all("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(port, (err) => {
        if(err) throw err;
        console.log('> Ready on http://localhost:8000');
    })
  })
  .catch((err) => {
    console.log("Error", err);
  });