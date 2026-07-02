const { User } = require("../models");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const publicUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  isAdmin: Boolean(user.isAdmin),
});

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    return res.status(201).json({
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`[LOGIN] Attempting login for email: ${email}`);

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

    return res.json({
      message: "Login successful",
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error(`[LOGIN] Error during login:`, error);
    return res.status(500).json({ error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, firstName, lastName, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Google account data is incomplete" });
    }

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        first_name: firstName || "",
        last_name: lastName || "",
        email,
        googleId,
        password: null,
        isAdmin: false,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    return res.json({
      message: "Google login successful",
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ message: "Google login failed", error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.reset_token = resetToken;
    user.reset_expires = new Date(Date.now() + 3600000);
    await user.save();

    return res.json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_token = null;
    user.reset_expires = null;
    await user.save();

    return res.json({
      message: "Password reset successful! You can now login with your new password.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.isAdmin = true;
      await existingUser.save();

      return res.json({
        message: "User updated to admin",
        user: publicUser(existingUser),
      });
    }

    const admin = await User.create({
      first_name: firstName || "Admin",
      last_name: lastName || "User",
      email,
      password: hashedPassword,
      isAdmin: true,
    });

    return res.status(201).json({
      message: "Admin created",
      user: publicUser(admin),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
