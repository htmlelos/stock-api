'use strict';
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const security = require('../services/security/security')
const message = require('../services/response/message')
const settings = require('../settings.cfg')

const login = (request, response) => {
  console.log('--HERE--');
  User.findOne({username: request.body.username})
    .then(user => {
      console.log('--HERE-1-');

      if (user) {
        security.verifyCredentials(request, response, user)
      } else {
        message.notAuthorized(response, {status: 401, message: 'No se pudo autenticar verifique sus credenciales', token: null})
      }
    })
    .catch(error => {
      console.log('--HERE-2-');
      message.failure(response, {status: 500, message: 'Eror al intentar autenticarse', data: error})
    })
}

const authenticate = (request, response, next) => {
  const token = request.body.token || request.query.token || request.headers['x-access-token']
  console.log('::token::', request.body.token);
  console.log('::token::', request.query.token);
  console.log('::token::', request.headers['x-access-token']);
  if (token) {
    // decodificar el token
    jwt.verify(token, settings.secret, (error, decoded) => {
      if (error) {
        return message.failure(response, {status: 401, message: 'Error al intentar autenticarse', success: false})
      } else {
        request.decoded = decoded
        next()
      }
    })
  } else {
    return message.failure(response, {status: 403, message: 'Por favor revise sus credenciales', success: false})
  }
}

module.exports = {
  login,
  authenticate
}
