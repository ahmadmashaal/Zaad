import express from "express";

const router = express.Router();

// Controllers
import { register, login, logout } from "../controllers/authController.js";

// Define your routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

// Export the router using ES module syntax
export default router;
