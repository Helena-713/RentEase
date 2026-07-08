const path = require('path');
const fs = require('fs');
const {
  UPLOAD_PUBLIC_PATH,
  VERIFICATION_DOCUMENT_PUBLIC_PATH,
} = require('../constants/upload');

const UPLOAD_DIR = path.resolve('uploads/profiles');
const VERIFICATION_DOCUMENT_DIR = path.resolve('uploads/landlord-verifications');

for (const dir of [UPLOAD_DIR, VERIFICATION_DOCUMENT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const buildProfileImagePath = (filename) =>
  `${UPLOAD_PUBLIC_PATH}/${filename}`;

const getProfileImageFilename = (publicPath) => {
  if (!publicPath) {
    return null;
  }
  return path.basename(publicPath);
};

const deleteProfileImageFile = (filename) => {
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const buildVerificationDocumentPath = (filename) =>
  `${VERIFICATION_DOCUMENT_PUBLIC_PATH}/${filename}`;

const getVerificationDocumentFilename = (publicPath) => {
  if (!publicPath) {
    return null;
  }
  return path.basename(publicPath);
};

const deleteVerificationDocumentFile = (filename) => {
  const filePath = path.join(VERIFICATION_DOCUMENT_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  UPLOAD_DIR,
  VERIFICATION_DOCUMENT_DIR,
  buildProfileImagePath,
  getProfileImageFilename,
  deleteProfileImageFile,
  buildVerificationDocumentPath,
  getVerificationDocumentFilename,
  deleteVerificationDocumentFile,
};
