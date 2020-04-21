const app = require('express')();
const database = require('./models/mongoose');
const router = require('./routes');
const middleware = require('./middlewares');
const events = require('./events/attach');
const { envs, get, print } = require('./utils/env');

const port = get(envs.PORT, 8081);

// LOADED ENV PRINT
print();

// DB Setup
database();

// MIDDLEWARES
middleware(app);

// ROUTER
router(app);

// EVENT LISTEN
events.init();

// EXPRESS LISTEN
app.listen(port);
