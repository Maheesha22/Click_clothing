// config/cloudinary.js
// Loads environment variables and configures the Cloudinary SDK.
// Make sure your .env file is in the BackEnd/ root folder.

require('dotenv').config();   // ← ensures .env is loaded when this file is required directly

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
});

// Quick validation — will warn in terminal if keys are missing
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY    ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn('⚠️  Cloudinary env vars missing! Check your BackEnd/.env file.');
  console.warn('   Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

module.exports = cloudinary;
