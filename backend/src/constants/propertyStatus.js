const PropertyStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  RENTED: 'RENTED',
  INACTIVE: 'INACTIVE',
};

const PROPERTY_STATUSES = Object.values(PropertyStatus);

module.exports = { PropertyStatus, PROPERTY_STATUSES };
