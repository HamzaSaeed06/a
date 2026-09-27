const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const { connectDB } = require("./utils/mongo");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./config/logger");
const { setupWebSocket } = require("./utils/websocket");
const backgroundJobs = require("./services/backgroundJobs");

const app = express();

app.set("trust proxy", 1);
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization", "x-device-secret"] }));
app.use(express.json({ limit: "10kb" }));


const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/bands", require("./routes/band.routes"));
app.use("/api/bands", require("./routes/profile.routes"));
app.use("/api/bands", require("./routes/savedLocation.routes"));
app.use("/api", require("./routes/savedLocation.routes"));
app.use("/api/bands", require("./routes/activity.routes"));
app.use("/api/bands", require("./routes/sos.routes"));
app.use("/api/alerts", require("./routes/alert.routes"));
app.use("/api/device", require("./routes/device.routes"));


app.use(errorHandler);

const server = http.createServer(app);

const start = async () => {
  await connectDB();
  setupWebSocket(server);
  backgroundJobs.start();
  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
  });
};

start().catch((err) => {
  console.error("Failed to start server error details:", err);
  process.exit(1);
});


module.exports = app;
