import User from "../models/user.js";
import { hashPassword, comparePassword } from "../utils/auth.js";
import { validateRegisterInput } from "../utils/validation.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * Controller to handle user registration.
 * It validates the input, hashes the password, and creates a new user in the database.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate the input
    const errors = validateRegisterInput({ name, email, password });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Split the name into first_name and last_name
    const [first_name, ...lastNameParts] = name.split(" ");
    const last_name = lastNameParts.join(" ") || null;

    // Check if user already exists in the database
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Hash the password before saving the user
    const hashedPassword = await hashPassword(password);

    // Create and save the new user
    const newUser = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      role: "student",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send a success response with user details
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: {
        id: newUser.user_id,
        name: `${newUser.first_name} ${newUser.last_name}`,
        email: newUser.email,
        role: newUser.role,
        profile_picture_url: newUser.profile_picture_url, // Include profile picture URL if available
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Controller to handle user login.
 * It validates the user's credentials and returns a JWT token if successful.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch the user from the database using email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "No user found with this email" });
    }

    // Compare the provided password with the stored hashed password
    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Create a signed JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        profile_picture_url: user.profile_picture_url, // Include profile picture URL in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send the token in a secure, HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send the token and user details in the response, excluding the password
    return res.status(200).json({
      user: {
        id: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
        profile_picture_url: user.profile_picture_url, // Return profile picture URL in response
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Controller to handle user logout.
 * It clears the JWT token from the cookies.
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Signout success" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Controller to fetch the current authenticated user.
 * It uses the user ID stored in the JWT to fetch the user details.
 */
export const currentUser = async (req, res) => {
  try {
    // Fetch the user from the database using the user ID from the JWT token
    const user = await User.findOne({ where: { user_id: req.auth.user_id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the user details, excluding the password
    return res.json({ ok: true });
  } catch (err) {
    console.error("Current user retrieval error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
