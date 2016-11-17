"use strict";
const mongoose = require('mongoose')
const Schema = mongoose.Schema
	// Establece las promesas de mongoose a las promesas nativas de javascript
mongoose.Promise = global.Promise

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

//TODO:0 Validar nombres de usuarios duplicados con path('username').validate
//TODO:10 Encriptado de la contraseña

module.exports = mongoose.model('user', UserSchema)
