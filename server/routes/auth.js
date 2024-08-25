import express from "express";

const router = express.Router();

// Controllers
import { register, login } from "../controllers/authController.js";

// Define your routes
router.post("/register", register);
router.post("/login", login);

// Export the router using ES module syntax
export default router;
