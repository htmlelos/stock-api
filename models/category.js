'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise
// Definicion del Esquema de Categoria
let CategorySchema = new Schema({
  name: {
    type: String,
    required: 'Debe proporcionar un nombre de Categoria',
    unique: true
  },
  description: {
    type: String,
    required: 'Debe proporcionar una description de la Categoria'
  },
  status: {
    type: String,
    enum: {
      values: ['ACTIVO', 'INACTIVO'],
      message: 'El estado del rol solo puede ser ACTIVO o INACTIVO'
    },
    required: 'Debe definir el estado de la categoria'
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

module.exports = mongoose.mongo('category', CategorySchema)