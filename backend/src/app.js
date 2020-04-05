const express = require('express');

const database = require('./models/mongoose');
const router = require('./routes');
const middleware = require('./middlewares');
const { envs, get } = require('./utils/env');

// APP
const app = express();

// MIDDLEWARES
middleware(app);

// DB Setup
database();

// ROUTER
router(app);

// LISTEN
app.listen(get(envs.PORT, 8081));
