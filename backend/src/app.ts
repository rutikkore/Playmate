import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:8081",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "PlayMate API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// Main Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

export default app;
