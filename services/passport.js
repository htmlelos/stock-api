const secret = require('./secret.cfg')
const passport = require('passport')
const bcrypt = require('bcrypt-nodejs')
const expressSession = require('express-session')

server.use(expressSession({secret.secret}))
server.use(passport.initialize())
server.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User.findById({_id: id})
    .then(user => {
      done(null, user)
    })
    .catch(error => {
      done(error)
    })
})

passport.use('login', new LocalStrategy({
  passReqToCallback: true
}, (request, username, password, done) => {
  // Verificar si existe un usuario con ese nombre de usuario
  User.findOne({'username': username})
    .then(user => {
      if (user) {
        // El usuario existe pero la contraseña es incorrecta
        if (!isValidPassword(username, password)) {
          console.error('Contraseña invalida');
          return done(null, false, request.flash('message', 'Contraseña incorrecta'))
        }
        // Usuario y contraseña correctas retornamos el usuario
        return done(null, user)
      } else {
        // El usuario no existe registrar el error y re direccionar
        console.error('No se encontro un usuario ', username);
        return done(null, false, request.flash('message', 'Usuario no encontrado'))
      }
    })
    .catch(error => {
      done(error)
    })
} ))

passport.use('signup', new LocalStrategy({
  passReqToCallback: true
}, (request, username, password, done) => {
  let findOrCreateUser = function () {
    // encuentra un usuario en mongo con el nombre de usuario provisto
    User.findOne({'username': username})
      .then(user => {
        // El usuario ya existe
        if (user) {
          console.log('El usuario ya existe');
          return done(null, false, request.flash('message', 'El usuario ya existe'))
        } else {
          // Si no existe un usuario con ese email, crearlo
          // Establece las credenciales locales
          let newUser = new User({
            username : username,
            password : createHash(password),
            status : 'ACTIVO'
          })

          newUser.save()
            .then(newUser => {
              return done(null, newUser)
            })
            .catch(error => {
              console.error('Error al guardar el nuevo usuario: ', error);
              throw error
            })
        }
      })
      .catch(error => {
        console.error('Ocurrio un error al registrarse ': error);
        return done(error)
      })
  }
  // Retrasa la ejecucion de findoOrCreateUser y ejecuta el método
  // En el siguiente tick del ciclo de eventos
  process.nextTick(findOrCreateUser)
}))

let isValidPassword = function (username, password) {
  return bcrypt.compareSync(password, user.password)
}

let createHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}
