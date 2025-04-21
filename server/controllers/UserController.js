import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/UserModel.js";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/TokenGenerator.js";

// REGISTER
// ENDPOINT: /api/register
// METHOD : POST
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    const userDetails = {
      username: newUser.username,
      email: newUser.email,
      _id: newUser._id
    };

    // Return tokens
    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: userDetails
    });
  } catch (err) {
    next(err);
  }
};

// LOGIN
// ENDPOINT: /api/login
// METHOD : POST
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    const userDetails = {
      username: user.username,
      email: user.email,
      _id: user._id
    };

    res.status(200).json({ accessToken, refreshToken, user: userDetails });
  } catch (err) {
    next(err);
  }
};

// REFRESH
// ENDPOINT: /api/refresh
// METHOD : POST
const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(403).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(user);

    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// LOGOUT (Invalidate refresh token)
// ENDPOINT: /api/logout
// METHOD : POST
const logout = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export { register, login, logout, refreshToken };
