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
        let token = jwt.sign(user, settings.secret, { expiresIn: "8h" })
        if (process.env.NODE_ENV === 'test') {
          request.decoded = {
            token,
            username: settings.superuser,
            roles: []
          }
         } 
        message.success(response, { status: 200, message: 'Usuario autenticado con exito', data: { token, username: user.username, roles: user.roles } })
      } else {
        if (user.status === 'INACTIVO') {
          message.notAuthorized(response, { status: 401, message: 'El usuario no esta ACTIVO, verifique sus credenciales', data: null })
        } else {
          message.notAuthorized(response, { status: 401, message: 'No se pudo autenticar, verifique sus credenciales', data: null })
        }
      }
    })
  }
}

module.exports = { verifyCredentials }
