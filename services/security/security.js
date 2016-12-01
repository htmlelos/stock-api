const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const message = require('../response/message')
const settings = require('../../settings.cfg')

const verifyCredentials = (request, response, user) => {
  if (user) {
    User.comparePasswordAndHash(request.body.password, user.password, (error, isAuthenticated) => {
      // Si la contraseña es correcta y el usuario esta activo
      // Se autentica el usuario
      if (user.status === 'ACTIVO' && isAuthenticated) {        
        let token = jwt.sign(user, settings.secret, {expiresIn: "8h"})
        global.currentUser = {
          username: user.username,
          roles: user.roles
        }
        message.success(response, {status: 200, message: 'Usuario autenticado con exito', token})
      } else {
        message.notAuthorized(response, {status: 401, message: 'No se pudo autenticar verifique sus credenciales', token: null})
      }
    })
  }
}

module.exports = { verifyCredentials }
