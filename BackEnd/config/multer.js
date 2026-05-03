// config/multer.js
// Configures multer to store uploaded images directly to Cloudinary.

const multer                = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary            = require('./cloudinary');   // ← uses our shared cloudinary instance

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder          : 'click_clothing_products',         // folder name in your Cloudinary account
    allowed_formats : ['jpg', 'jpeg', 'png', 'webp'],
    transformation  : [{ width: 800, crop: 'limit', quality: 'auto' }],  // resize large images
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

module.exports = upload;
