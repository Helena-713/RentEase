const UPLOAD_MAX_FILE_SIZE_MB = 5;
const UPLOAD_MAX_FILE_SIZE = UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

const UPLOAD_PUBLIC_PATH = '/uploads/profiles';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

module.exports = {
  UPLOAD_MAX_FILE_SIZE_MB,
  UPLOAD_MAX_FILE_SIZE,
  UPLOAD_PUBLIC_PATH,
  ALLOWED_IMAGE_TYPES,
};
