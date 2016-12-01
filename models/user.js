
'use strict';
const bcrypt = require('bcrypt-nodejs')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
	// Establece las promesas de mongoose a las promesas nativas de javascript
mongoose.Promise = global.Promise

let SALT_WORK_FACTOR = 12;

let match = [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'El username debe se un correo electronico por ejemplo "username@servidor.com"']

const UserSchema = new Schema({
	username: {
		type: String,
		required: 'Debe proporcionar un nombre de usuario',
		match: match,
		unique: true
	},
	password: {
		type: String,
		required: 'Debe proporcionar una contraseña'
	},
	status: {
		type: String,
		enum: {
			values: ['ACTIVO', 'INACTIVO'],
			message: 'El estado de usuario solo puede ser ACTIVO o INACTIVO'
		},
		required: 'Debe definir el estado del usuario'
	},
	roles: [String],
	profiles: [{
		type: Schema.Types.ObjectId,
		ref: 'Profile'
	}],
	createdAt: {
		type: Date,
		required: true,
		default: Date()
	},
	createdBy: {
		type: String,
		required: true,
		default: 'anonimo'
	},
	modifiedAt: {
		type: Date
	},
	modifiedBy: {
		type: String
	}
}, {
	versionKey: false
})
// Statics
UserSchema.pre('save', function(next) {
    let user = this

    let now = new Date()
        // Se asigna la fecha actual al
    if (!this.createdAt) {
        this.createdAt = now
    }
    // Se asigna el usuario por omisión
    if (!this.createdBy) {
        this.createdBy = 'anonimo'
    }
    // Solo encriptar el password si se ha modificado la contraseña o es un nuevo usuario

    if (!user.isModified()) return next();
    // Para acelerar los test, verificamos NODE_ENV
    // Si estamos realizando test, establecemos el costo SALT_WORK_FACTOR = 1
    if (process.env.NODE_ENV === 'test') {
        SALT_WORK_FACTOR = 1
    }
    // Generar una nueva salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(error, salt) {
        if (error) return next(error);

        // Encriptar el usuario junto a la nueva salt

        bcrypt.hash(user.password, salt, function() {}, function(err, hash) {
            if (err) return next(err);

            // sobreescribe la contraseña en texto plano con la contraseña encriptada
            user.password = hash;
            next();
        })
    })
})

UserSchema.statics.hashPassword = function(password, next) {
    // Para acelerar los test, verificamos NODE_ENV
    // Si estamos realizando test, establecemos el costo SALT_WORK_FACTOR = 1
    if (process.env.NODE_ENV === 'test') {
        SALT_WORK_FACTOR = 1
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function(error, salt) {
        // Encriptar la contraseña utilizando bcrypt; pasa la funcion
        // callback `next`a bcrypt.hash()
        bcrypt.hash(password, salt, function() {}, next)
    });
}

UserSchema.statics.comparePasswordAndHash = function(password, passwordHash, next) {
    // compara las contraseñas proporcionadas
    bcrypt.compare(password, passwordHash, next)
}

module.exports = mongoose.model('user', UserSchema)
