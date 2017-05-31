'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas de mongoose a las promesas nativas de javascript
mongoose.Promise = global.Promise

const BrandSchema = new Schema({
	name: {
		type: String,
		required: 'Debe proporcionar un nombre para la marca',
		unique: true
	},
	description: {
		type: String
	},
	suppliers: [{
		type: Schema.Types.ObjectId,
		ref: 'Person'
	}],
	status: {
		type: String,
		enum: {
			values: ['ACTIVO', 'INACTIVO'],
			message: 'El estado de la marca solo puede ser ACTIVO o INACTIVO'
		},
		required: 'Debe definir el estado de la marca'
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

module.exports = mongoose.model('Brand', BrandSchema)
