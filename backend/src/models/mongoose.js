// Connect to mongodb
const mongoose = require('mongoose');
const { logDatabase, logError } = require('../utils/logger');
const { envs, get } = require('../utils/env');
const seedStatus = require('../helpers/models/seed/status/status');

// Enviroment variables
const DATABASE_URL = get(envs.DATABASE_URL, '0.0.0.0:27017');
const DATABASE_NAME = get(envs.DATABASE_NAME, 'cashbackBoticario');
const willSeedStatus = Boolean(get(envs.SEED_STATUS, true));

const init = () => {
  mongoose.set('useUnifiedTopology', true);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useFindAndModify', false);
  mongoose.connect(`mongodb://${DATABASE_URL}/${DATABASE_NAME}`, { useNewUrlParser: true });

  // Got connection handler
  const db = mongoose.connection;

  // Retry on first error connect
  db.on('error', (error) => {
    // If first connect fails because server-database isn't up yet, try again.
    // This is only needed for first connect, not for runtime reconnects.
    // See: https://github.com/Automattic/mongoose/issues/5169
    if (error.message && error.message.match(/failed to connect to server .* on first connect/)) {
      setTimeout(() => {
        mongoose.connect(`mongodb://${DATABASE_URL}/${DATABASE_NAME}`, { useNewUrlParser: true }).catch(() => {
          // empty catch avoids unhandled rejections
        });
      }, 20 * 1000);
    } else {
      // Some other error occurred.  Log it.
      logError(String(error));
    }
  });

  // On open execute
  db.once('open', () => {
    logDatabase('Connection Succeeded!');
    if (willSeedStatus) {
      seedStatus();
    }
  });

  return db;
};

module.exports = init;
