import { DataTypes } from "sequelize";
import { sql } from "../config/db.js";
import { hashPassword } from "../utils/auth.js";

const User = sql.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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

        // Hash the password before saving
        user.password_hash = await hashPassword(user.password_hash);
      },
      beforeUpdate: async (user) => {
        // Hash the password only if it has been changed
        if (user.changed("password_hash")) {
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
