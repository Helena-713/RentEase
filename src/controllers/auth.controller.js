const authService = require('../services/auth.service');

const register = async (req, res) => {
  const data = await authService.register(req.body);

  res.status(201).json({
    success: true,
    data,
  });
};

const login = async (req, res) => {
  const data = await authService.login(req.body);

  res.status(200).json({
    success: true,
    data,
  });
};

module.exports = { register, login };
