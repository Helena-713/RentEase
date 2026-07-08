require('dotenv').config();

const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

if (!secret) {
  throw new Error('JWT_SECRET environment variable is required');
}

module.exports = { secret, expiresIn };
