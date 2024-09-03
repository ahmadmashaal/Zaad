import { DataTypes } from "sequelize";
import { sql } from "../config/db.js";
import { hashPassword } from "../utils/auth.js";

const User = sql.define(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        isLowercase: true,
        matchesEmailFormat(value) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            throw new Error('Invalid email format');
          }
        },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isStrongPassword(value) {
          const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
          if (!strongPasswordRegex.test(value)) {
            throw new Error(
              "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character."
            );
          }
        },
        len: {
          args: [8, 255],
          msg: "Password must be at least 8 characters long",
        },
      },
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "student",
      validate: {
        isIn: [["student", "instructor", "admin"]],
      },
    },
    bio: {
      type: DataTypes.TEXT, // VARCHAR(MAX) maps to TEXT in Sequelize
      allowNull: true,
    },
    profile_picture_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password_reset_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users", // Explicitly defines the table name
    timestamps: true,  // Let Sequelize handle `createdAt` and `updatedAt`
    createdAt: 'created_at',  // Map to your custom field name in the database
    updatedAt: 'updated_at',  // Map to your custom field name in the database
    hooks: {
      beforeCreate: async (user) => {
        // Convert email to lowercase before saving
        user.email = user.email.toLowerCase();

        // Hash the password before saving, only if it is not already hashed
        if (!user.password_hash.startsWith("$2b$")) {
          user.password_hash = await hashPassword(user.password_hash);
        }
      },
      beforeUpdate: async (user) => {
        // Hash the password only if it has been changed and is not already hashed
        if (user.changed("password_hash") && !user.password_hash.startsWith("$2b$")) {
          user.password_hash = await hashPassword(user.password_hash);
        }
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
    validate: {
      emailFormat() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
          throw new Error("Invalid email format");
        }
      },
    },
  }
);

export default User;
