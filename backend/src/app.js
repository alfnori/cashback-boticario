const express = require('express');
const database = require('./models/mongoose');
const router = require('./routes');
const middleware = require('./middlewares');
const { envs, get } = require('./utils/env');

// DB Setup
database();

// APP
const app = express();

// MIDDLEWARES
middleware(app);

// ROUTER
router(app);

// LISTEN
app.listen(get(envs.PORT, 8081));
