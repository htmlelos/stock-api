const Business = require('../../models/business')
const User = require('../../models/user')
const settings = require('../../settings')

// Esta funcionalidad permite crear un superusuario para el sistema
// La contraseña de este usuario debe ser modificada luego de 
// iniciada la aplicacion por primera vez
module.exports = function superUser(server) {
    server.use(function (request, response, next) {

        User.findOne({ username: settings.superuser })
            .then(user => {
                if (!user) {
                    const superuser = new User({
                        username: settings.superuser,
                        password: 'super',
                        business: null,
                        status: 'ACTIVO'
                    })
                    return superuser.save()
                }
                return Promise.resolve(user)
            })
            .then(user => {
                next()
            })
            .catch(error => {
                next(error);
            })
    })
}