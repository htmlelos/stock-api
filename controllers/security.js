'use strict';
const jwt = require('jsonwebtoken')
const Role = require('../models/role')
const User = require('../models/user')
const security = require('../services/security/security')
const message = require('../services/response/message')
const settings = require('../settings.cfg')

const login = (request, response) => {
  // console.log('--LOGIN--CALLED--')
  // console.log('--USERNAME--', request.body.username);
  User.findOne({ username: request.body.username })
    .then(user => {
      if (user) {
        Role.populate(user, { path: 'roles' })
          .then(user => {
            // console.log('--LOGIN--CALLED-A-')
            user.roles = user.roles.map(element => { return element.name })
            security.verifyCredentials(request, response, user)
          })
          .catch(error => {
            // console.log('--LOGIN--CALLED--ERROR-500-1--')
            message.error(response, { status: 500, message: '', data: error })
          })
      } else {
        message.notAuthorized(response, { status: 401, message: 'No se pudo autenticar verifique sus credenciales', token: null })
      }
    })
    .catch(error => {
      // console.log('--LOGIN--CALLED--ERROR-500-2--')
      message.error(response, { status: 500, message: '', data: error })
    })
}

// const login = (request, response) => {
//   User.findOne({username: request.body.username})
//     .then(user => {
//       if (user) {
//         user.comparePassword(request.body.password, (error, isMatch) => {
//           if (isMatch && !error) {
//             let token = jwt.sign(user, settings.secret, { expiresIn: 10080})
//             message.success(response, { status: 200, message: 'Usuario autenticado con exito', data: {token, username: user.username, roles: user.roles}}) 
//           } else {
//             message.failure(response, { status: 401, message: 'No se pudo autenticar verifique sus credenciales', data: null})
//           }
//         })
//       } else {
//             message.failure(response, { status: 401, message: 'No se pudo autenticar verifique sus credenciales', data: null})
//       }
//     })
//     .catch(error => {
//       message.error(response, { status: 500, message: '', data: error})
//     })
// }

const authenticate = (request, response, next) => {
  const token = request.body.token || request.query.token || request.headers['x-access-token']
  if (token) {
    // decodificar el token
    jwt.verify(token, settings.secret, (error, decoded) => {
      if (error) {
        return message.failure(response, { status: 401, message: 'Error al intentar autenticarse', success: false })
      } else {
        request.decoded = decoded._doc
        next()
      }
    })
  } else {
    return message.failure(response, { status: 403, message: 'Por favor revise sus credenciales', success: false })
  }
}



module.exports = {
  login,
  authenticate
}
