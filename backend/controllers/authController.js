const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d"
    }
  );
};


// ================= REGISTER =================

const register = async (req, res) => {
  try {
    let { name, email, mobile, password } = req.body;

    // Check required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Clean input
    name = name.trim();
    email = email.trim().toLowerCase();
    mobile = mobile.trim();

    // Validate name
    if (name.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters"
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    // Validate mobile number
    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        message: "Mobile number must contain exactly 10 digits"
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters"
      });
    }

    // Check whether email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "User already exists with this email"
      });
    }

    // Check whether mobile already exists
    const existingMobile = await User.findOne({ mobile });

    if (existingMobile) {
      return res.status(400).json({
        message: "User already exists with this mobile number"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      isBankCustomer: false
    });

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isBankCustomer: user.isBankCustomer
      }
    });

  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed. Please try again."
    });
  }
};


// ================= LOGIN =================

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Clean email
    email = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isBankCustomer: user.isBankCustomer
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed. Please try again."
    });
  }
};


module.exports = {
  register,
  login
};