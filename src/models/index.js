const fs = require('fs');
const path = require('path');
const sequelize = require('../config/sequelize');

const models = {};

const modelFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'));

for (const file of modelFiles) {
  const model = require(path.join(__dirname, file));
  models[model.name] = model;
}

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

models.sequelize = sequelize;

module.exports = models;
