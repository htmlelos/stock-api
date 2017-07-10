'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise
	//Role Schema Definition
	//Definición del Esquema del rol
let RoleSchema = new Schema({
	name: {
		type: String,
		required: 'Debe proporcionar un nombre de Rol',
		unique: true
	},
	description: {
		type: String,
		required: 'Debe proporcionar una descripción del Rol'
	},
	status: {
		type: String,
		enum: {
			values: ['ACTIVO', 'INACTIVO'],
			message: 'El estado del Rol solo puede ser ACTIVO o INACTIVO'
		},
		required: 'Debe definir el estado del Rol'
	},
	business: {
		type: Schema.Types.ObjectId,
		ref: 'Business'
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	createdBy: {
		type: String,
		required: true,
		default: 'anonimo'
	},
	updatedAt: {
		type: Date
	},
	updatedBy: {
		type: String
	}
}, {
	versionKey: false
})

module.exports = mongoose.model('Role', RoleSchema)
