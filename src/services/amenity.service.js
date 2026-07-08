const { Amenity } = require('../models');
const AppError = require('../utils/AppError');
const { getPaginationOptions } = require('../utils/pagination');

const sanitizeAmenity = (amenity) => ({
  id: amenity.id,
  name: amenity.name,
  createdAt: amenity.createdAt,
  updatedAt: amenity.updatedAt,
});

const create = async ({ name }) => {
  const amenity = await Amenity.create({
    name: name.trim(),
  });

  return sanitizeAmenity(amenity);
};

const list = async ({ page, limit }) => {
  const { rows, count } = await Amenity.findAndCountAll({
    order: [['name', 'ASC']],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map(sanitizeAmenity),
    total: count,
  };
};

const getById = async (id) => {
  const amenity = await Amenity.findByPk(id);

  if (!amenity) {
    throw new AppError('Amenity not found', 404);
  }

  return sanitizeAmenity(amenity);
};

module.exports = {
  sanitizeAmenity,
  create,
  list,
  getById,
};
