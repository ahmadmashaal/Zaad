import express from "express";

// Controllers
import { register , login } from "../controllers/authController.js";

const router = express.Router();

// Define your routes
router.post("/register", register);
router.post("/login", login);


// Export the router using ES module syntax
export default router;
