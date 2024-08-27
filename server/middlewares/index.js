import { expressjwt } from "express-jwt";

/**
 * Middleware to protect routes by requiring a valid JWT.
 *
 * This middleware verifies the JWT sent in the request cookies.
 * If the JWT is valid, the user is authenticated and can access the route.
 * Otherwise, the request is denied.
 */
export const requireSignin = expressjwt({
  // Function to extract the token from the request cookies.
  getToken: (req) => {
    console.log("Token in request cookies:", req.cookies.token); // Log the token extracted from cookies
    return req.cookies.token;
  },

  // JWT secret key for verifying the token. Ensure this matches the secret used to sign the JWTs.
  secret: process.env.JWT_SECRET,

  // Specify the algorithm used to sign the JWT. "HS256" is the most common.
  algorithms: ["HS256"],

  // Extract the token from cookies
  getToken: (req) => {
    console.log("Token in request cookies:", req.cookies.token);
    return req.cookies.token;
  },
});
