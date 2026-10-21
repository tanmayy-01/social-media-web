import { loginUserService, signupUserService } from "../services/userService.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await loginUserService({ email, password });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully!",
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to login",
    });
  }
};

export const signin = login;

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const response = await signupUserService({ username, email, password });

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to signup",
    });
  }
};
