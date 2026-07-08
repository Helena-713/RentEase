const path = require('path');
const fs = require('fs');
const { UPLOAD_PUBLIC_PATH } = require('../constants/upload');

const UPLOAD_DIR = path.resolve('uploads/profiles');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const buildProfileImagePath = (filename) =>
  `${UPLOAD_PUBLIC_PATH}/${filename}`;

const deleteProfileImageFile = (filename) => {
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  UPLOAD_DIR,
  buildProfileImagePath,
  deleteProfileImageFile,
};
