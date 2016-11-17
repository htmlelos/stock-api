"use strict";
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promises
	// Profile Schema Definition
	// Definicion del Esquema del perfil
let ProfileSchema = new Schema({
	name: {
		type: String,
		required: 'Debe proporcionar un nombre de perfil',
		unique: true
	},
	description: {
		type: String,
		required: 'Debe proporcionar una descripcion del perfil'
	},
	status: {
		type: String,
		enum: {
			values: ['ACTIVO', 'INACTIVO'],
			message: 'El estado del perfil solo puede ser ACTIVO o INACTIVO'
		},
		required: 'Debe definir el estado del perfil'
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

module.exports = mongoose.model('profile', ProfileSchema)
