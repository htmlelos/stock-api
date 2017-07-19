'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas de mongoose como las promesas
mongoose.Promise = global.Promise

const DocumentSchema = new Schema({
    documentType: {
        type: String,
        enum: {
            values: ['ORDEN', 'RECEPCION', 'FACTURA'],
            message: 'El tipo de documento solo puede ser ORDEN, RECEPCION o FACTURA'
        },
        required: 'Debe indicar el tipo del documento'
    }
    , documentName: {
        type: String,
        required: 'Debe indicar el nombre del documento'
    },
    documentNumber: {
        type: Number,
        required: `Debe indicar el numero del Documento`
    },
    business: {
        type: Schema.Types.ObjectId,
        ref: 'Business'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'Person'
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'Person'
    },
    detail: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            default: 0
        }
    }],
    subtotal: {
        type: Number
    },
    salesTaxes: {
        type: Number
        // Minimo y Maximo
    },
    total: {
        type: Number
    }
})

module.exports = mongoose.model('Document', DocumentSchema)