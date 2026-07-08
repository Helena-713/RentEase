const swaggerUi = require('swagger-ui-express');
const { generateOpenApiDocument } = require('../docs');

const setupSwagger = (app) => {
  const spec = generateOpenApiDocument();

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/api-docs.json', (_req, res) => {
    res.json(spec);
  });
};

module.exports = { setupSwagger };
