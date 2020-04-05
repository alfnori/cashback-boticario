#!/bin/sh
export DEBUG_TAG=$DEBUG_TAG
export PORT=$SERVER_PORT
DEBUG_TAG=$DEBUG_TAG PORT=$PORT nodemon src/app.js