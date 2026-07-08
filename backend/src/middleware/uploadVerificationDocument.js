const path = require('path');
const multer = require('multer');
const { randomUUID } = require('crypto');
const AppError = require('../utils/AppError');
const { VERIFICATION_DOCUMENT_DIR } = require('../config/upload');
const {
  UPLOAD_MAX_FILE_SIZE,
  UPLOAD_MAX_FILE_SIZE_MB,
  ALLOWED_VERIFICATION_DOCUMENT_TYPES,
} = require('../constants/upload');

const storage = multer.diskStorage({
  destination: VERIFICATION_DOCUMENT_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_VERIFICATION_DOCUMENT_TYPES.includes(file.mimetype)) {
    req.log?.warn(
      { mimetype: file.mimetype },
      'Verification document rejected: invalid file type'
    );
    return cb(
      new AppError('Only PDF and image files are allowed', 400)
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: UPLOAD_MAX_FILE_SIZE },
});

const uploadVerificationDocument = (req, res, next) => {
  upload.single('verificationDocument')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        req.log?.warn(
          { code: err.code },
          'Verification document rejected: file too large'
        );
        return next(
          new AppError(
            `File too large. Maximum size is ${UPLOAD_MAX_FILE_SIZE_MB} MB`,
            400
          )
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

module.exports = uploadVerificationDocument;
