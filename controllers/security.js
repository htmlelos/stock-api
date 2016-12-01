'use strict';
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const security = require('../services/security/security')
const message = require('../services/response/message')
const settings = require('../settings.cfg')

const login = (request, response) => {
  User.findOne({username: request.body.username})
    .then(user => {

      if (user) {
        security.verifyCredentials(request, response, user)
      } else {
        message.notAuthorized(response, {status: 401, message: 'No se pudo autenticar verifique sus credenciales', token: null})
      }
    })
    .catch(error => {
      message.error(response, {status: 500, message: '', data: error})
    })
}

const authenticate = (request, response, next) => {
  const token = request.body.token || request.query.token || request.headers['x-access-token']
  if (token) {
    // decodificar el token
    jwt.verify(token, settings.secret, (error, decoded) => {
      if (error) {
        return message.failure(response, {status: 401, message: 'Error al intentar autenticarse', success: false})
      } else {
        request.decoded = decoded._doc
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
