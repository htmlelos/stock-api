'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas nativas como libreria de promesas para mongoose
mongoose.Promise = global.Promise

const PriceListSchema = new Schema({
  name: {
    type: String,
    required: 'Debe proporcionar un nombre para la lista de precios',
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: 'Debe proporcionar una descripcion para la lista de precios'
  },
  status: {
    type: String,
    enum: {
      values: ['ACTIVO', 'INACTIVO'],
      message: 'La Lista de Precios solo puede estar en estado ACTIVO o INACTIVO'
    },
    required: 'Debe proporcionar el estado de la Lista de Precios'
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
  }
}, {
    versionKey: false
  })

module.exports = mongoose.model('PriceList', PriceListSchema)