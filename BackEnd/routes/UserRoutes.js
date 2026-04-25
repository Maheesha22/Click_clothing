const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);

module.exports = router;
