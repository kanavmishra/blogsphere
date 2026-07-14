import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";


// Connect to MongoDB
connectDB();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://blogsphere-cgk6-six.vercel.app",
  "http://localhost:5173"
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.startsWith("http://localhost:");
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false); // Allow request, let client handle CORS or fallback
    }
  },
  credentials: true
};

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀😍👍 BlogSphere Backend is Running!");
});

// Start Server
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    ...corsOptions,
    methods: ["GET", "POST", "PUT", "DELETE"]
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Set global io for controller access
global.io = io;

httpServer.listen(PORT, () => {
  console.log(`🚀😍👌 Server running on port ${PORT}`);
});