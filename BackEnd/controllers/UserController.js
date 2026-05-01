const { User } = require("../models");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const { Op } = require('sequelize');

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
      firstName: firstName,
      lastName: lastName,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN - Updated to support both hashed and plain text passwords
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password is hashed (starts with $2b$) or plain text
    let isValid = false;
    
    if (user.password && user.password.startsWith('$2b$')) {
      // Hashed password
      isValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password (for admin123)
      isValid = (user.password === password);
    }

    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // return user data
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { email, firstName, lastName, googleId } = req.body;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        firstName: firstName || "",
        lastName: lastName || "",
        email: email,
        googleId: googleId,
        password: null,
        isAdmin: false
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    res.json({
      message: "Google login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
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
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ 
        message: "No account found with this email address" 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.reset_token = resetToken;
    user.reset_expires = new Date(Date.now() + 3600000);
    await user.save();

    console.log("Reset token for:", email, "→", resetToken);

    res.json({ 
      message: "Password reset link sent to your email",
      resetToken: resetToken
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({ 
      where: { 
        reset_token: token,
        reset_expires: { [Op.gt]: new Date() }
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token" 
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

// CREATE ADMIN WITH PLAIN TEXT PASSWORD (For testing)
exports.createPlainTextAdmin = async (req, res) => {
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
      firstName: firstName || "Admin",
      lastName: lastName || "User",
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
