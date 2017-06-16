'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise

const DocumentSchema = new Schema({
    header: {
        type: {
            type: String,
        enum: {
            values: ['FACTURA', 'ORDEN', 'REMITO', 'RECIBO', 'RECEPCION', 'DESPACHO'],
            message: 'El tipo de dactura solo puede ser FACTURA, ORDEN, REMITO, RECIBO, RECEPCION o DESPACHO'
        },
            required: 'Debe indicar el tipo de documento'            
        },
        status: {
            type: String,
            required: 'El documento debe tener un estado'
        },
        documentNumber: {
            type: String,
            required: 'El comprobante debe tener un numero de comprobante'
        },
        documentDate: {
            type: Date,
            required: 'Debe indicar la fecha del comprobante'
        },
        actors: [{type: Schema.Types.ObjectId, ref: 'Person'}],
        business: {type: Schema.Types.ObjectId, ref: 'Business'}
    },
    details: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: 'Debe inidicar la cantidad del producto'
            },
            price: {
                type: Number
            },
            discount: {
                type: Number
            }
        }
    ],
    footer: {
        subtotal: {
            type: Number
        },
        discounts: {
            type: Number
        },
        taxes: {
            type: Number
        }
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },    
    createdBy: {
        type: Date,
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

module.exports = mongoose.model('Document', DocumentSchema)