const { Property, PropertyImage, User, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { PropertyStatus } = require('../constants/propertyStatus');
const { MAX_PROPERTY_IMAGES } = require('../constants/upload');
const {
  buildPropertyImagePath,
  getPropertyImageFilename,
  deletePropertyImageFile,
  deletePropertyImageFiles,
} = require('../config/upload');

const imageInclude = {
  model: PropertyImage,
  as: 'images',
  separate: true,
  order: [['displayOrder', 'ASC']],
};

const sanitizeLandlordSummary = (landlord) => ({
  id: landlord.id,
  firstName: landlord.firstName,
  lastName: landlord.lastName,
  email: landlord.email,
  phone: landlord.phone,
});

const sanitizeImage = (image) => ({
  id: image.id,
  propertyId: image.propertyId,
  imageUrl: image.imageUrl,
  isCover: image.isCover,
  displayOrder: image.displayOrder,
  createdAt: image.createdAt,
});

const sanitizeProperty = (property, { includeLandlord = false } = {}) => {
  const result = {
    id: property.id,
    landlordId: property.landlordId,
    title: property.title,
    description: property.description,
    address: property.address,
    city: property.city,
    state: property.state,
    price: Number(property.price),
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqft: property.areaSqft,
    status: property.status,
    isApproved: property.isApproved,
    rejectionReason: property.rejectionReason,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    images: property.images
      ? property.images.map(sanitizeImage)
      : undefined,
  };

  if (includeLandlord && property.landlord) {
    result.landlord = sanitizeLandlordSummary(property.landlord);
  }

  return result;
};

const findOwnedProperty = async (propertyId, landlordId) => {
  const property = await Property.findOne({
    where: { id: propertyId, landlordId },
    include: [imageInclude],
  });

  if (!property) {
    throw new AppError('Property not found', 404);
  }

  return property;
};

const ensureSingleCover = async (propertyId, coverImageId, transaction) => {
  await PropertyImage.update(
    { isCover: false },
    { where: { propertyId }, transaction }
  );

  if (coverImageId) {
    await PropertyImage.update(
      { isCover: true },
      { where: { id: coverImageId, propertyId }, transaction }
    );
  }
};

const createImageRecords = async (
  propertyId,
  files,
  { startOrder = 1, setFirstAsCover = false, transaction }
) => {
  const records = files.map((file, index) => ({
    propertyId,
    imageUrl: buildPropertyImagePath(file.filename),
    displayOrder: startOrder + index,
    isCover: setFirstAsCover && index === 0,
  }));

  return PropertyImage.bulkCreate(records, { transaction });
};

const create = async (landlordId, data, files, { log: requestLog } = {}) => {
  const log = requestLog || logger;

  if (!files?.length) {
    throw new AppError('At least one property image is required', 400);
  }

  if (files.length > MAX_PROPERTY_IMAGES) {
    throw new AppError(`Maximum ${MAX_PROPERTY_IMAGES} images allowed`, 400);
  }

  const uploadedFilenames = files.map((f) => f.filename);
  const transaction = await sequelize.transaction();

  try {
    const property = await Property.create(
      {
        landlordId,
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        price: data.price,
        propertyType: data.propertyType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        areaSqft: data.areaSqft,
        status: PropertyStatus.AVAILABLE,
        isApproved: false,
      },
      { transaction }
    );

    await createImageRecords(property.id, files, {
      startOrder: 1,
      setFirstAsCover: true,
      transaction,
    });

    await transaction.commit();

    return getByIdForOwner(property.id, landlordId);
  } catch (err) {
    await transaction.rollback();
    deletePropertyImageFiles(uploadedFilenames);

    if (!(err instanceof AppError)) {
      log.warn({ landlordId, err: err.message }, 'Property creation failed');
    }

    throw err;
  }
};

const listMine = async (landlordId) => {
  const properties = await Property.findAll({
    where: { landlordId },
    include: [imageInclude],
    order: [['createdAt', 'DESC']],
  });

  return properties.map((property) => sanitizeProperty(property));
};

const getByIdForOwner = async (propertyId, landlordId) => {
  const property = await findOwnedProperty(propertyId, landlordId);
  return sanitizeProperty(property);
};

const buildUpdatePayload = (data) => {
  const updates = {};
  const fields = [
    'title',
    'description',
    'address',
    'city',
    'state',
    'price',
    'propertyType',
    'bedrooms',
    'bathrooms',
    'areaSqft',
    'status',
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  return updates;
};

const update = async (
  propertyId,
  landlordId,
  data,
  files,
  { log: requestLog } = {}
) => {
  const log = requestLog || logger;
  const property = await findOwnedProperty(propertyId, landlordId);
  const currentCount = property.images.length;
  const newCount = files?.length ?? 0;

  if (currentCount + newCount > MAX_PROPERTY_IMAGES) {
    if (newCount > 0) {
      deletePropertyImageFiles(files.map((f) => f.filename));
    }
    throw new AppError(
      `Maximum ${MAX_PROPERTY_IMAGES} images allowed per property`,
      400
    );
  }

  const updates = buildUpdatePayload(data);

  if (Object.keys(updates).length === 0 && newCount === 0) {
    throw new AppError('At least one field or image must be provided', 400);
  }

  const uploadedFilenames = files?.map((f) => f.filename) ?? [];
  const transaction = await sequelize.transaction();

  try {
    if (Object.keys(updates).length > 0) {
      await property.update(updates, { transaction });
    }

    if (newCount > 0) {
      const maxOrder = property.images.reduce(
        (max, img) => Math.max(max, img.displayOrder),
        0
      );

      await createImageRecords(property.id, files, {
        startOrder: maxOrder + 1,
        setFirstAsCover: false,
        transaction,
      });
    }

    await transaction.commit();
    return getByIdForOwner(propertyId, landlordId);
  } catch (err) {
    await transaction.rollback();
    deletePropertyImageFiles(uploadedFilenames);

    if (!(err instanceof AppError)) {
      log.warn(
        { propertyId, landlordId, err: err.message },
        'Property update failed'
      );
    }

    throw err;
  }
};

const deleteImage = async (propertyId, imageId, landlordId) => {
  const property = await findOwnedProperty(propertyId, landlordId);

  if (property.images.length <= 1) {
    throw new AppError('Property must have at least one image', 400);
  }

  const image = property.images.find((img) => img.id === imageId);

  if (!image) {
    throw new AppError('Property image not found', 404);
  }

  const filename = getPropertyImageFilename(image.imageUrl);
  const wasCover = image.isCover;
  const transaction = await sequelize.transaction();

  try {
    await image.destroy({ transaction });

    const remaining = property.images
      .filter((img) => img.id !== imageId)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    for (let i = 0; i < remaining.length; i++) {
      await remaining[i].update({ displayOrder: i + 1 }, { transaction });
    }

    let coverImageId = null;
    if (wasCover && remaining.length > 0) {
      coverImageId = remaining[0].id;
    } else if (!wasCover) {
      const currentCover = remaining.find((img) => img.isCover);
      coverImageId = currentCover?.id ?? remaining[0]?.id;
    }

    await ensureSingleCover(property.id, coverImageId, transaction);
    await transaction.commit();

    if (filename) {
      deletePropertyImageFile(filename);
    }

    return getByIdForOwner(propertyId, landlordId);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const listPending = async () => {
  const properties = await Property.findAll({
    where: { isApproved: false },
    include: [
      imageInclude,
      {
        model: User,
        as: 'landlord',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  return properties.map((property) =>
    sanitizeProperty(property, { includeLandlord: true })
  );
};

const review = async (propertyId, { isApproved, rejectionReason }) => {
  const property = await Property.findByPk(propertyId, {
    include: [imageInclude],
  });

  if (!property) {
    throw new AppError('Property not found', 404);
  }

  if (property.isApproved) {
    throw new AppError('Only unapproved properties can be reviewed', 400);
  }

  if (!isApproved) {
    if (!rejectionReason?.trim()) {
      throw new AppError('Rejection reason is required', 400);
    }

    await property.update({
      rejectionReason: rejectionReason.trim(),
    });
  } else {
    await property.update({
      isApproved: true,
      rejectionReason: null,
    });
  }

  await property.reload({ include: [imageInclude] });
  return sanitizeProperty(property);
};

module.exports = {
  sanitizeProperty,
  create,
  listMine,
  getByIdForOwner,
  update,
  deleteImage,
  listPending,
  review,
};
