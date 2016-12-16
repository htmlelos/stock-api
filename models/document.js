'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas de mongoose a las promesas nativas de javascriot
mongoose.Promise = global.Promise

const Stackholder = new Schema({
    name: {
        type: 'String',
        required: 'Debe proporcionar el nombre del interesado'
    },
    kind: {
        type: 'String',
        enum: {
            values: ['VENDEDOR', 'CLIENTE', 'RECEPTOR', 'DESPACHANTE', 'PROVEEDOR'],
            message: 'El tipo de interesado solo puede ser VENDEDOR o CLIENTE o RECEPTOR o DESPACHANTE o PROVEEDOR'
        },
        required: 'Debe proporcionar el tipo de interesado'
    },
    address: {
        type: 'String'        
    }
})

const Bussines = new Schema({
    name: {
        type: 'String',
        required: 'Debe proporcionar el nombre de la empresa'
    },
    cuit: {
        type: 'String',
        required: 'Debe proporcionar el número de CUIT'
    },
    iibb: {
        type: 'String',
        required: 'Debe proporcionar el número de ingresos brutos'
    },
    iva: {
        type: 'String',
        enum: {
            values: ['INSCRIPTO', 'NO INSCRIPTO', 'MONOTRIBUTO'],
            message: 'El tipo de I.V.A. solo puede ser INSCRIPTO, NO INSCRIPTO o MONOTRIBUTO'
        }
    }
})

const Detail = new Schema({
    product: { 
        type:Schema.Types.ObjectId,
        ref: 'Product' 
    },
    quantity: number,
    price: number
})

const DocumentSchema = new Schema({    
    code: {
        type: String,
        required: true,        
    },
    dateDocument: {
        type: Date,
        default: Date().now,
        index: true
    },
    bussines: {
        type: Schema.Types.ObjectId,
        ref: 'Bussines'
    },
    stackholder: ['Stackholder'],    
    document: {
        type: String,
        enum: {
            values: ['FACTURA', 'ORDEN', 'RECIBO', 'REMITO'],
            message: 'El tipo de documento solo puede ser FACTURA u ORDEN o RECIBO o REMITO'
        },
        required: 'Debe definir un tipo de documento'
    },
    details: ['Detail'],
    currentState: {
        type: String,   // Enum?        
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
},{
    versionKey: false
})

module.exports = mongoose.model('document', DocumentSchema)