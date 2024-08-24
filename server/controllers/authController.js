import User from "../models/user.js";
import { hashPassword, comparePassword } from "../utils/auth.js";
import { validateRegisterInput } from "../utils/validation.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate the input
    const errors = validateRegisterInput({ name, email, password });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Ensure first_name and last_name are properly split
    const [first_name, ...lastNameParts] = name.split(" ");
    const last_name = lastNameParts.join(" ") || null; // Handle empty last name case

    // Check if user already exists
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    console.log('Registration - Plain Password:', password);

    // Hash the password
    const hashedPassword = await hashPassword(password);

    console.log('Registration - Hashed Password:', hashedPassword);

    // Save the user with the role set to 'student'
    const newUser = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      role: "student", // Explicitly set the role to 'student'
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('Registration - Stored Password Hash:', newUser.password_hash);

    // Send a success response
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: {
        id: newUser.user_id,
        name: `${newUser.first_name} ${newUser.last_name}`,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // Fetch the user from the database

    console.log('Login - Received Email:', email);
    console.log('Login - Received Password:', password);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "No user found with this email" });
    }

    console.log('Login - Stored Password Hash:', user.password_hash);

    console.log("Retrieved Password Hash:", user.password_hash);
    console.log("Hash Length:", user.password_hash.length);

    console.log("Plain Password:", password);
    console.log("Stored Hashed Password:", user.password_hash);

    // Compare password
    const match = await comparePassword(password, user.password_hash);

    console.log('Login - Password Match Result:', match);

    if (!match) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Create a signed JWT
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send the token in a secure, HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
      sameSite: "strict", // Protect against CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send the token and user details in the response, without the password
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
