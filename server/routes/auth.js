import express from "express";

const router = express.Router();

//controllers
import { register } from "../controllers/auth.js";

router.get("/register", register);

module.exports = router;
