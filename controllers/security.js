'use strict';
const jwt = require('jsonwebtoken')
const Role = require('../models/role')
const User = require('../models/user')
const security = require('../services/security/security')
const message = require('../services/response/message')
const settings = require('../settings.cfg')

const login = (request, response) => {
  request.checkBody('username', 'Nombre de usuario invalido').notEmpty().isEmail()
  request.checkBody('password', 'Contraseña invalida').notEmpty().isLength({min: 4})
  // Validar los parametros de entrada
  request.getValidationResult()
    .then(result => {
      let errors = result.useFirstErrorOnly().array()
      console.log(errors)
      if (errors) {
        let messages = []
        errors.forEach(error => messages.push(error.msg))
        messages.join()
        console.log('MESSAGES: ',messages)
        message.notAuthorized(response, 401, messages, { token: null })
      }
    })
  // Verificar las credenciales
  User.findOne({ username: request.body.username })
    .then(user => {
      if (user) {
        Role.populate(user, { path: 'roles' })
          .then(user => {
            user.roles = user.roles.map(element => { return element.name })
            security.verifyCredentials(request, response, user)
          })
          .catch(error => {
            message.error(response, 500, '', error)
          })
      } else {
        message.notAuthorized(response, 401, 'No se pudo autenticar verifique sus credenciales', { token: null })
      }
    })
    .catch(error => {
      message.error(response, 500, '', error)
    })
}

const authenticate = (request, response, next) => {
  const token = request.body.token || request.query.token || request.headers['x-access-token']
  if (token) {
    // decodificar el token
    jwt.verify(token, settings.secret, (error, decoded) => {
      if (error) {
        return message.failure(response, 401, 'Error al intentar autenticarse', { success: false })
      } else {
        request.decoded = decoded._doc
        //console.log('--VERIFY--', request.decoded);
        next()
      }
    })
  } else {
    return message.failure(response, 403, 'Por favor revise sus credenciales', { success: false })
  }
}



module.exports = {
  login,
  authenticate
}
