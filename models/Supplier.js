'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas de mongoose a las promesas nativas de javascript
mongoose.Promise = global.Promise

const Address = new Schema({
  address: {
    type: String
  }
},{
  versionKey: false
})

const Contact = new Schema({
  phone: {
    type: String
  },
  name: {
    type: String
  }
},{
  versionKey: false
})

const SupplierSchema = new Schema({
  name: {
    type: String,
    required: 'Debe proporcionar un nombre para el proveedor',
    unique: true
  },
  addresses: [Address],
  contacts: [Contact],
  status: {
    type: String,
    enum: {
      values: ['ACTIVO', 'INACTIVO'],
      message: 'El estado del proveedor solo puede ser ACTIVO o INACTIVO'
    },
    required: 'Debe definir el estado del proveedor'
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date().now
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
