'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise
let MovementSchema = new Schema({
    type: {
        type: String,
        enum: {
            values: ['INGRESO', 'EGRESO'],
            message: 'El tipo de movimiento solo puede ser INGRESO o EGRESO'
        },
        required: 'Debe proporcionar un tipo de movimiento'
    },
    kind: {
        type: String,
        enum: {
            values: ['COMPRA', 'VENTA', 'TRANSFERENCIA', 'AJUSTE'],
            required: 'La clase de movimiento solo puede ser COMPRA, VENTA, TRANSFERENCIA o AJUSTE'
        },
        required: 'Debe proporcionar la clase de movimiento'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Movement'
    },
    quantity: {
        type: Number,
        required: 'Debe indicar la cantidad del movimiento'
    },
    origin: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
    destination: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
    batchCode: {
        type: String,
        ref: 'Batch'
    },
    observation: {
        type: String
    },
    documentOrigin: {
        type: Schema.Types.ObjectId,
        ref: 'Documents'
    },
    dateMovement: {
        type: Date,
        required: 'Debe proporcionar la fecha de movimiento'
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    createdBy: {
        type: String,
        require: true,
        default: 'anonimo'
    },
    updateAt: {
        type: Date
    },
    updateBy: {
        type: String
    }
}, {
        versionKey: false
    })

module.exports = mongoose.model('Movement', MovementSchema)