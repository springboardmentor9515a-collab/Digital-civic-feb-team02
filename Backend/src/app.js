const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// Import routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// --------------- URL Cleanup ---------------
// Decode and strip any whitespace/newlines from URLs
app.use((req, res, next) => {
  req.url = decodeURIComponent(req.url).replace(/[\n\r\s]+/g, "");
  next();
});

// --------------- Security Middleware ---------------
app.use(helmet());

// --------------- CORS ---------------
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// --------------- Rate Limiting ---------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter);

// --------------- Body Parsers ---------------
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// --------------- Cookie Parser ---------------
app.use(cookieParser());

// --------------- Logging ---------------
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// --------------- Health Check ---------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Civix API is running",
  });
});

// --------------- API Routes ---------------
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// --------------- Error Handling ---------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
