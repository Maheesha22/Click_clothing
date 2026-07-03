const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { Op } = require('sequelize');
const { notifyNewCustomerSignup } = require('../services/notificationService');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      isAdmin: false
    });

    // Notify the admin dashboard of the new registration (non-blocking).
    notifyNewCustomerSignup(user).catch(err => console.error('notifyNewCustomerSignup failed:', err));

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: user.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`[LOGIN] Attempting login for email: ${email}`);

    // find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`[LOGIN] User not found: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`[LOGIN] User found: ${email}, password stored: ${user.password ? 'YES' : 'NO'}`);

    let isValid = false;

    if (user.password && user.password.startsWith("$2")) {
      console.log(`[LOGIN] Password is hashed (bcrypt), comparing...`);
      isValid = await bcrypt.compare(password, user.password);
    } else {
      console.log(`[LOGIN] Password is plain text, doing direct comparison...`);
      isValid = user.password === password;
      if (isValid) {
        console.log(`[LOGIN] Plain text password matched, hashing for future use...`);
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    console.log(`[LOGIN] Password validation result: ${isValid}`);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // return user data with token
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error(`[LOGIN] Error during login:`, error);
    return res.status(500).json({ error: error.message });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { email, firstName, lastName, googleId } = req.body;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        first_name: firstName || "",
        last_name: lastName || "",
        email: email,
        googleId: googleId,
        password: null,
        isAdmin: false
      });

      // New account via Google — notify the admin dashboard (non-blocking).
      notifyNewCustomerSignup(user).catch(err => console.error('notifyNewCustomerSignup failed:', err));
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    res.json({
      message: "Google login successful",
      token: jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      ),
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email, clientOrigin } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ 
        message: "No account found with this email address" 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.reset_token = otp;
    user.reset_expires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    console.log("OTP for:", email, "→", otp);

    // Send email
    const { sendPasswordResetEmail } = require('../services/emailService');
    try {
      await sendPasswordResetEmail(email, otp);
      res.json({ 
        message: "Password reset OTP sent to your email"
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      res.status(500).json({ message: "Failed to send reset email. Please try again later." });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ 
      where: { 
        email: email,
        reset_token: otp,
        reset_expires: { [Op.gt]: new Date() }
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired OTP" 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.reset_token = null;
    user.reset_expires = null;
    await user.save();

    res.json({ 
      message: "Password reset successful! You can now login with your new password." 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAdmin = exports.createPlainTextAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      // Update existing user to admin with plain text password
      existingUser.password = password;
      existingUser.isAdmin = true;
      await existingUser.save();
      
      return res.json({ 
        message: "User updated to admin with plain text password",
        email: existingUser.email,
        isAdmin: true
      });
    }
    
    // Create new admin with plain text password
    const admin = await User.create({
      first_name: firstName || "Admin",
      last_name: lastName || "User",
      email: email,
      password: password,  // Store as plain text
      isAdmin: true
    });
    
    res.status(201).json({
      message: "Admin created with plain text password",
      email: admin.email,
      password: password,
      isAdmin: true
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
