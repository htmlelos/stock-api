'use strict';
const mongoose = require('mongoose')
const Supplier = require('./supplier')
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
    ref: 'Supplier'
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

module.exports = mongoose.model('brand', BrandSchema)
