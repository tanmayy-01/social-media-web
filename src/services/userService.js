import jwt from "jsonwebtoken";
import { JWT_EXPIRY, JWT_SECRET } from "../config/serverConfig.js";
import { createUser, findUserByEmail } from "../repositories/userRepository.js";

export const loginUserService = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("No user found with this email.");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error("Invalid password.");
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
    }
  );

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
};

export const signinUserService = loginUserService;

export const signupUserService = async ({ username, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const user = await createUser({
    username,
    email,
    password,
  });

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
    }
  );

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
};
