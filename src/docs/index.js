require('./paths/health.path');
require('./paths/auth.path');
require('./paths/user.path');
require('./paths/landlordVerification.path');
require('./paths/property.path');
require('./paths/amenity.path');
require('./paths/application.path');
require('./paths/review.path');

const { OpenApiGeneratorV3 } = require('@asteasolutions/zod-to-openapi');
const registry = require('./registry');
const { version } = require('../../package.json');

const generateOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'RentEase API',
      version,
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
      },
    ],
  });
};

module.exports = { generateOpenApiDocument };
