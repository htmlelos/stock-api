"use strict";
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promises
	//Role Schema Definition
	//Definición del Esquema del rol
let RoleSchema = new Schema({
	name: {
		type: String,
		required: 'Debe proporcionar un nombre de rol',
		unique: true
	},
	description: {
		type: String,
		required: 'Debe proporcionar una descripcion del rol'
	},
	status: {
		type: String,
		enum: {
			values: ['ACTIVO', 'INACTIVO'],
			message: 'El estado del rol solo puede ser ACTIVO o INACTIVO'
		},
		required: 'Debe definir el estado del rol'
	},
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
		type: false
	}
}, {
	versionKey: false
})

module.exports = mongoose.model('role', RoleSchema)
