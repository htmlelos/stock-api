'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise

let CounterSchema = new Schema({
    name: {
        type: String,
        required: 'Debe indicar el nombre de la colección de datos',
        unique: true,
        index: true
    },
    incrementBy: {
        type: Number,
        required: 'Debe indicar el incremento del contador',
        default: 1
    },
    value: {
        type: Number,
        default: null
    },
    type: {
        type: String,
        enum: {
            values: ['FACTURA','ORDEN','PEDIDO', 'RECEPCION', 'REMITO'],
            message: 'El tipo solo puede ser FACTURA, ORDEN, PEDIDO, RECEPCION o REMITO'
        },
        required: 'Debe definir el tipo de contador'
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

module.exports = mongoose.model('Counter', CounterSchema)