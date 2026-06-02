import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json());

  // Socket.io Logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("send-message", (data) => {
      // data: { roomId, message, senderId, senderName }
      io.to(data.roomId).emit("new-message", data);
    });

    socket.on("pulse-rebound", (data) => {
       // Collaborative radar pulse rebound
       socket.broadcast.emit("remote-pulse", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Database connection pool
  let pool: mysql.Pool | null = null;

  function getPool() {
    if (!pool) {
      // Using provided credentials as defaults while allowing env overrides
      const host = process.env.DB_HOST || "localhost";
      const user = process.env.DB_USER || "root";
      const password = process.env.DB_PASSWORD || "root";
      const database = process.env.DB_NAME || "job_radar";
      const port = parseInt(process.env.DB_PORT || "3306");

      console.log(`Attempting to connect to MySQL at ${host}:${port} as ${user}...`);

      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    return pool;
  }

  // Initialize Database Tables
  const initDb = async () => {
    // We try to connect to localhost by default, which will skip if not available
    const dbPool = getPool();
    if (!dbPool) return;

    try {
      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          company VARCHAR(255) NOT NULL,
          category ENUM('LOCAL', 'IT') NOT NULL,
          salary VARCHAR(100),
          lat DECIMAL(10, 8),
          lng DECIMAL(11, 8),
          address TEXT,
          area VARCHAR(100),
          skills_required TEXT,
          urgent BOOLEAN DEFAULT FALSE,
          posted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          description TEXT,
          status ENUM('OPEN', 'CLOSED', 'PENDING', 'REJECTED') DEFAULT 'OPEN'
        )
      `);
      console.log("Database tables initialized successfully.");
    } catch (error: any) {
      console.error("Database initialization notice (Normal if no database configured yet):", error.message);
    }
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  app.get("/api/db-status", async (req, res) => {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(500).json({ status: "error", message: "Database configuration missing" });
    }
    try {
      const [rows] = await dbPool.query("SELECT 1 as connection_test");
      res.json({ status: "connected", data: rows });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Example: Get jobs from DB
  app.get("/api/jobs", async (req, res) => {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(503).json({ error: "Database not configured" });
    }
    try {
      const [rows] = await dbPool.query("SELECT * FROM jobs");
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start the server immediately so it passes Cloud Run health checks
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Initialize DB in background
    initDb().catch(console.error);
  });
}

startServer().catch(console.error);
