const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const customerRoutes = require("./routes/customerRoutes");
const loanRoutes = require("./routes/loanRoutes");
const eligibilityRoutes = require("./routes/eligibilityRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const documentRoutes = require("./routes/documentRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:5177",
        "http://127.0.0.1:5178",
        "http://127.0.0.1:5179",
        "http://127.0.0.1:5180"
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/documents", documentRoutes);

// Connect database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});