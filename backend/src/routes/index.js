const statusRoutes = require('./status');
const purchasesRoutes = require('./purchases');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const misc = require('../controllers/misc');
const { notFoundResponse } = require('../helpers/request');

// TODO Use an cache like Redis
global.rootReached = 0;

/**
 * Initializes Express Routes
 * @param {Express.Application} app The express Application
 */
const init = (app) => {
  app.get('/', misc.welcome);
  app.get('/public/counter', misc.counter);
  app.use('/api/status', statusRoutes);
  app.use('/api/purchases', purchasesRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.all('*', notFoundResponse);
};

module.exports = init;
