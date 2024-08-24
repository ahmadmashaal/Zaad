import bcrypt from "bcrypt";

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - The hashed password.
 */

export async function hashPassword(password) {
  const SALT_ROUNDS = 10;
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error("Error hashing password");
  }
}

/**
 * Compares a plain text password with a hashed password.
 * @param {string} plainPassword - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - Returns true if the passwords match, false otherwise.
 */

export async function comparePassword(plainPassword, hashedPassword) {
  try {

    // Trim the plain password 
    const trimmedPassword = plainPassword.trim();

    return await bcrypt.compare(trimmedPassword, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw new Error("Error comparing passwords");
  }
}
