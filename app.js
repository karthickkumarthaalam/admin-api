const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
const apiRoutes = require("./routes");
require("dotenv").config();

require("./jobs/deleteOldBudgets");
require("./jobs/deleteOldExpenses");

const startPackageExpiryChecker = require("./jobs/packageStatusCron");
startPackageExpiryChecker();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/payments/webhook", require("./routes/webhookRoutes"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", apiRoutes);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH"],
  },
});

app.set("io", io);

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    const initAllSockets = require("./sockets");
    initAllSockets(io);
  })
  .catch((err) => {
    console.error("Redis connection error:", err);
  });

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server with Socket.IO running on port ${PORT}`);
});
