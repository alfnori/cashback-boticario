#!/bin/sh
export DEBUG=$DEBUG_TAG
export PORT=$SERVER_PORT
export NODE_ENV=development
NODE_ENV=development DEBUG=$DEBUG_TAG PORT=$PORT nodemon --watch ./ --inspect=0.0.0.0:$DEBUG_PORT --nolazy ./src/app.js