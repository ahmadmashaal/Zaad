export function validateRegisterInput({ name, email, password }) {
    const errors = [];
    
    // Validate Name
    if (!name) {
        errors.push("Name is required");
    }

    // Validate Email
    if (!email) {
        errors.push("Email is required");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push("Invalid email format");
        }
        if (email !== email.toLowerCase()) {
            errors.push("Email must be in lowercase");
        }
    }

    // Validate Password
    if (!password || password.length < 8) {
        errors.push("Password is required and should be at least 8 characters long");
    } else {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            errors.push("Password must include at least one lowercase letter, one uppercase letter, one number, and one special character.");
        }
    }
    
    return errors;
}
