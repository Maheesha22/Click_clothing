const multer                = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary            = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder          : 'click_clothing_reviews',
    allowed_formats : ['jpg', 'jpeg', 'png', 'webp'],
    transformation  : [{ width: 1000, crop: 'limit', quality: 'auto' }],
  },
});

const uploadReview = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

module.exports = uploadReview;
