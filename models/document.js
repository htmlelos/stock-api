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
            message: `El tipo de documento solo puede ser ORDEN, RECEPCION o FACTURA`
        },
        required: `Debe indicar el tipo del documento`,
        index: true
    }
    , documentName: {
        type: String,
        required: `Debe indicar el nombre del documento`
    },
    documentNumber: {
        type: Number,
        index: true
    },
    documentDate: {
        type: Date,
        required: `Debe indicar la fecha del Documento`,
        index: true
    },
    business: {
        type: Schema.Types.ObjectId,
        ref: `Business`,
        index: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: `Person`,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: `Person`,
        index: true
    },
    detail: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: `Product`
        },
        quantity: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enume: {
                values: ['ACEPTADO', 'FALTANTE', 'RECHAZADO'],
                message: 'El estado del detalle solo puede ser ACEPTADO, FALTANTE o RECHAZADO'
            }
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
    },
    status: {
        type: String,
        enum: {
            values: ['CREADO', 'GENERADO'],
            messages: 'El estado de la orden de compra solo puede ser CREADO o GENERADO'
        },
        required: 'Debe definir el estado de la orden de compra',
        default: 'CREADO'
    },
})

module.exports = mongoose.model('Document', DocumentSchema)