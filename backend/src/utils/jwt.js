const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');

const signToken = (payload) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  const decoded = jwt.decode(token);

  return {
    token,
    expiresAt: new Date(decoded.exp * 1000).toISOString(),
  };
};

const verifyToken = (token) => jwt.verify(token, secret);

module.exports = { signToken, verifyToken };
