'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas de mongoose a las promesas nativas de javascript
mongoose.Promise = global.Promise

const SupplierSchema = new Schema({
  name: {
    type: String,
    required: 'Debe proporcionar un nombre para el proveedor',
    unique: true
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
    type: String
  }
},{
  versionKey: false
})

module.exports = mongoose.model('supplier', SupplierSchema)
