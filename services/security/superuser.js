const User = require('../../models/user')
const settings = require('../../settings')

// Esta funcionalidad permite crear un superusuario para el sistema
// La contraseña de este usuario debe ser modificada luego de 
// iniciada la aplicacion por primera vez
module.exports = function superUser(server) {
    server.use(function(request, response, next) {
        User.findOne({username: settings.superuser})
            .then(user => {
                if (!user) {
                    const superuser = new User({
                        username: settings.superuser,
                        password: 'super',
                        status: 'ACTIVO'
                    })

                    superuser.save()
                        .then(user => {
                            next()
                        })
                        .catch(error => {
                            next(error)
                        })
                } else {
                    next()
                }
            })
            .catch(error => {
                next(error);
            })        
    })
}