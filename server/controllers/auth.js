import User from "../models/user.js";
import { hashPassword } from "../utils/auth.js";
import { validateRegisterInput } from "../utils/validation.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate the input
        const errors = validateRegisterInput({ name, email, password });
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Ensure first_name and last_name are properly split
        const [first_name, ...lastNameParts] = name.split(' ');
        const last_name = lastNameParts.join(' ') || null; // Handle empty last name case

        // Check if user already exists
        const userExist = await User.findOne({ where: { email } });
        if (userExist) {
            return res.status(400).json({ error: "Email is already taken" });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Save the user with the role set to 'student'
        const newUser = await User.create({
          first_name,
          last_name,
          email: email.toLowerCase(),
          password_hash: hashedPassword,
          role: 'student',  // Explicitly set the role to 'student'
          created_at: new Date(),
          updated_at: new Date(),
      });

        // Send a success response
        return res.status(201).json({ message: "User registered successfully", userId: newUser.user_id });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
