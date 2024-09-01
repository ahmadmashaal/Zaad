import express from "express";

const router = express.Router();

// Middlewares
import { requireSignin } from "../middlewares/index.js";

// Controllers
import { register, login, logout, currentUser, sendTestEmail } from "../controllers/authController.js";

// Define your routes
router.post("/register", register); // Route for user registration
router.post("/login", login); // Route for user login
router.get("/logout", logout); // Route for user logout
router.get("/current-user", requireSignin, currentUser); // Protected route to get current user
router.get('/send-email', sendTestEmail);

// Export the router using ES module syntax
export default router;
