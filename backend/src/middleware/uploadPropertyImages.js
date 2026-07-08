const path = require('path');
const multer = require('multer');
const { randomUUID } = require('crypto');
const AppError = require('../utils/AppError');
const { PROPERTY_IMAGES_DIR } = require('../config/upload');
const {
  UPLOAD_MAX_FILE_SIZE,
  UPLOAD_MAX_FILE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
  MAX_PROPERTY_IMAGES,
} = require('../constants/upload');

const storage = multer.diskStorage({
  destination: PROPERTY_IMAGES_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    req.log?.warn(
      { mimetype: file.mimetype },
      'Property image rejected: invalid file type'
    );
    return cb(new AppError('Only image files are allowed', 400));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: UPLOAD_MAX_FILE_SIZE },
});

const uploadPropertyImages = (req, res, next) => {
  upload.array('propertyImages', MAX_PROPERTY_IMAGES)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        req.log?.warn({ code: err.code }, 'Property image rejected: file too large');
        return next(
          new AppError(
            `File too large. Maximum size is ${UPLOAD_MAX_FILE_SIZE_MB} MB`,
            400
          )
        );
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(
          new AppError(`Maximum ${MAX_PROPERTY_IMAGES} images allowed`, 400)
        );
      }
      return next(new AppError(err.message, 400));
    }
    if (err) {
      return next(err);
    }

    next();
  });
};

module.exports = uploadPropertyImages;
