const authService = require('../services/auth.service');
const { buildProfileImagePath } = require('../config/upload');

const register = async (req, res) => {
  const profileImage = req.file
    ? buildProfileImagePath(req.file.filename)
    : null;

  const data = await authService.register(
    { ...req.body, profileImage },
    {
      uploadedFilename: req.file?.filename,
      log: req.log,
    }
  );

  res.status(201).json({
    success: true,
    data,
  });
};

const login = async (req, res) => {
  const data = await authService.login(req.body, { log: req.log });

  res.status(200).json({
    success: true,
    data,
  });
};

module.exports = { register, login };
