const controller = {};

const { jsonResponse, httpResponse } = require('../helpers/request');
const { logRequest } = require('../utils/logger');

controller.welcome = (req, res) => {
  global.rootReached += 1;
  logRequest(`/ reached ${global.rootReached} times!`);
  const data = `<!doctype HTML>
    <html>
      <head>
      <title>Welcome</title>
      <meta charset="utf-8">
      <style type="text/css">
        body {
          background-color: #282c34; min-height: 100vh; display: flex;
          flex-direction: column; align-items: center; justify-content: center;
          font-size: calc(10px + 2vmin); color: #fff;
        }
        h1 { font-size: 1.5rem; text-transform: uppercase; padding: 0.25rem; }
        .border { border: 1px solid #5fd0ae; border-radius: 0.25rem; }
      </style>
      </head>
      <body>
        <h1 class='border' >Welcome Counter: ${global.rootReached}</h1>
        <img class='border' src="https://i.imgflip.com/2084ea.jpg"/>
      </body>
    </html>`;
  httpResponse(data, res);
};

controller.counter = (req, res) => {
  global.rootReached += 1;
  jsonResponse(null, { counter: global.rootReached }, res);
};

module.exports = controller;
