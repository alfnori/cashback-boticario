const app = require('express')();
const database = require('./models/mongoose');
const router = require('./routes');
const middleware = require('./middlewares');
const { envs, get, print } = require('./utils/env');

// TODO Use an cache like Redis
global.rootReached = 0;

// DB Setup
database();

// MIDDLEWARES
middleware(app);

// ROUTER
router(app);

// LISTEN
app.listen(get(envs.PORT, 8081));

// LOADED ENV
print();
