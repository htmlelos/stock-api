'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise
// Definicion del Esquema de Categoría
let CategorySchema = new Schema({
  name: {
    type: String,
    required: 'Debe proporcionar un nombre de categoría',
    unique: true
  },
  description: {
    type: String,
    required: 'Debe proporcionar una descripción de la categoría'
  },
  status: {
    type: String,
    enum: {
      values: ['ACTIVO', 'INACTIVO'],
      message: 'El estado de la categoria solo puede ser ACTIVO o INACTIVO'
    },
    required: 'Debe definir el estado de la categoría'
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

CategorySchema.add({categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }]})  

module.exports = mongoose.model('Category', CategorySchema)