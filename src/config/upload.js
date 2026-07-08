const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.resolve('uploads/profiles');
const UPLOAD_PUBLIC_PATH = '/uploads/profiles';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

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
  UPLOAD_PUBLIC_PATH,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  buildProfileImagePath,
  deleteProfileImageFile,
};
