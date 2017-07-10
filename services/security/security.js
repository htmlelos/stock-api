const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const message = require('../response/message')
const settings = require('../../settings')

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
        message.success(response, 200, 'Usuario autenticado con éxito', { token, username: user.username, business: user.business, roles: user.roles })
      } else {
        if (user.status === 'INACTIVO') {
          message.notAuthorized(response, 401, 'El usuario no esta ACTIVO, verifique sus credenciales', null)
        } else {
          message.notAuthorized(response, 401, 'No se pudo autenticar, verifique sus credenciales', null )
        }
      }
    })
  }
}

module.exports = { verifyCredentials }
