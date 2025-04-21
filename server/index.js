import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";

// Middlewares
import ErrorHandler from "./middlewares/ErrorHandler.js";
import ErrorLogger from "./middlewares/ErrorLogger.js";
import RateLimiter from "./middlewares/RateLimiter.js";

// DB Connection
import connectDB from "./config/DB.js";

// Routes
import UserRoutes from "./routes/UserRoutes.js";
import NoteRoutes from "./routes/NoteRoutes.js";

dotenv.config();

const app = express();

// === MongoDB Connection ===
connectDB();


// === Global Middlewares ===
app.use(express.json());

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["POST", "GET", "PATCH", "DELETE"]
}));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// === Rate Limiter 
app.use(RateLimiter);

// === Logger Middleware for logging errors
app.use(ErrorLogger);

// === Routes ===
app.use("/api", UserRoutes);
app.use("/api/notes", NoteRoutes);

// === Error Handler 
app.use(ErrorHandler);

// === Server Start ===
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
