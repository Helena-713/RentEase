const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json());

app.use('/api', routes);

if (process.env.NODE_ENV === 'development') {
  const { setupSwagger } = require('./config/swagger');
  setupSwagger(app);
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
