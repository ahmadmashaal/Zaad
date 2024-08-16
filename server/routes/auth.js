import express from "express";
import { register } from "../controllers/auth.js";

const router = express.Router();

// Define your routes
router.post("/register", register);

// Export the router using ES module syntax
export default router;
