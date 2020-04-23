const axios = require('axios');
const { envs, get } = require('../utils/env');
const { logError } = require('../utils/logger');
const { validatorCPF } = require('../utils/validators');
const { assembleRequestError } = require('../helpers/request');

const API_URL = get(envs.CASHBACK_API_URL,
  'https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1');

const API_TOKEN = get(envs.CASHBACK_API_TOKEN, 'ZXPURQOARHiMc6Y0flhRC1LVlZQVFRnm');

const cashbackBoticario = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    Authorization: `Token ${API_TOKEN}`,
  },
});

/**
 * Callback to receive value from external API
 * @typedef {import('../utils/transformer.js').RequestError} RequestError
 * @callback cashbackCallback
 * @param {Error|RequestError} error A possible error
 * @param {*} data A result value
 */

/**
 * Tries to retrive cashback information from Boticario's API
 *
 * @param {String} cpf An valid CPF to be matched
 * @param {cashbackCallback} callback An callback to send result
 */
const retriveCashbackByCPF = (cpf, callback) => {
  logError(cpf);
  const stripedCPF = validatorCPF.strip(cpf);
  const byCPF = `/cashback?cpf=${stripedCPF}`;
  cashbackBoticario.get(byCPF)
    .then((res) => {
      if (res.status === 200) {
        const { data } = res;
        const { body } = data;
        if (data.statusCode === 200) {
          callback(null, body);
        } else {
          callback(assembleRequestError(body));
        }
      } else {
        const err = assembleRequestError({
          message: 'Failed to retrive information from external cashback API properly. Try again later.',
          error: 'ExternalAPIResponseProblem',
          statusCode: 424,
        });
        callback(err);
      }
    })
    .catch((error) => {
      logError(error);
      const err = assembleRequestError({
        message: 'Cannot connect with external cashback API properly. Try again later.',
        error: 'ExternalAPIConnectionProblem',
        statusCode: 424,
      });
      callback(err);
    });
};

module.exports = {
  retriveCashbackByCPF,
};
