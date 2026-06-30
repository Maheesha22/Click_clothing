const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { authenticate, requireAdmin } = require("../middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/admin", authenticate, requireAdmin, userController.createAdmin);

module.exports = router;
