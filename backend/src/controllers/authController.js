import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {user,token,},
    });
  } 
  catch (error) {
    console.error("Registration error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({success: false, message: "Validation failed", errors, });
    }
    res.status(500).json({ success: false, message: "Internal server error",error: error.message, });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required",});
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({success: false, message: "Invalid email or password",});
    }

    const token = generateToken(user._id);

    res.status(200).json({success: true, message: "Login successful",data: { user,token,},});
  } 
  catch (error) {
    console.error("Login error:", error);
    res.status(500).json({success: false, message: "Internal server error",});
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({success: true, data: {user: req.user, },});
  } 
  catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({success: false,message: "Internal server error",});
  }
};
