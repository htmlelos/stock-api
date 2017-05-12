'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas de mongoose a las promesas nativas de javascriot
mongoose.Promise = global.Promise

// const Stackholder = new Schema({
//     name: {
//         type: 'String',
//         required: 'Debe proporcionar el nombre del interesado'
//     },
//     type: {
//         type: 'String',
//         enum: {
//             values: ['VENDEDOR', 'CLIENTE', 'RECEPTOR', 'DESPACHANTE', 'PROVEEDOR'],
//             message: 'El tipo de interesado solo puede ser VENDEDOR o CLIENTE o RECEPTOR o DESPACHANTE o PROVEEDOR'
//         },
//         required: 'Debe proporcionar el tipo de interesado'
//     },
//     address: {
//         type: 'String'        
//     }
// })

// const business = new Schema({
//     name: {
//         type: 'String',
//         required: 'Debe proporcionar el nombre de la empresa'
//     },
//     cuit: {
//         type: 'String',
//         required: 'Debe proporcionar el número de CUIT'
//     },
//     iibb: {
//         type: 'String',
//         required: 'Debe proporcionar el número de ingresos brutos'
//     },
//     iva: {
//         type: 'String',
//         enum: {
//             values: ['INSCRIPTO', 'NO INSCRIPTO', 'MONOTRIBUTO'],
//             message: 'El tipo de I.V.A. solo puede ser INSCRIPTO, NO INSCRIPTO o MONOTRIBUTO'
//         }
//     }
// })

// const Detail = new Schema({
//     product: { 
//         type:Schema.Types.ObjectId,
//         ref: 'Product' 
//     },
//     quantity: Number,
//     price: Number
// })

// const DocumentSchema = new Schema({    
//     code: {
//         type: String,
//         required: true,        
//     },
//     dateDocument: {
//         type: Date,
//         default: Date().now,
//         index: true
//     },
//     business: {
//         type: Schema.Types.ObjectId,
//         ref: 'business'
//     },
//     stackholder: ['Stackholder'],    
//     type: {
//         type: String,
//         enum: {
//             values: ['FACTURA', 'ORDEN', 'RECIBO', 'REMITO'],
//             message: 'El tipo de documento solo puede ser FACTURA u ORDEN o RECIBO o REMITO'
//         },
//         required: 'Debe definir un tipo de documento'
//     },
//     details: ['Detail'],
//     currentState: {
//         type: String,   // Enum?        
//     },
// 	createdAt: {
// 		type: Date,
// 		required: true,
// 		default: Date.now
// 	},
// 	createdBy: {
// 		type: String,
// 		required: true,
// 		default: 'anonimo'
// 	},
// 	updatedAt: {
// 		type: Date
// 	},
// 	updatedBy: {
// 		type: String
// 	}
// },{
//     versionKey: false
// })

const Header = new Schema({
    type: {
        type: Schema.Types.ObjectId,        
        ref: 'DocumentType',
        required: 'Debe proporcionar un tipo de comprobante',
    },
    status: {
        type: String,
        required: 'El comprobante debe tener un estado',
    },
    number: {
        type: String,
        required: 'El comprobante debe tener un número de comprobante'
    },
    date: {
        type: Date,
        required: 'Debe indicar la fecha del comprobante'
    },
    payment: {
        type: String,
        enum: {
            values: ['CONTADO, CREDITO, DEBITO'],
            message: 'El estado de un usuario solo puede ser CONTADO, CREDITO o DEBITO'
        }
    },
    actors: [{ type: Schema.Types.ObjectId, ref: 'Person', }]
}, {
        versionKey: false
    })

const Details = new Schema({
    code: {
        type: String,
        required: 'Debe proporcionar el código de producto'
    },
    name: {
        type: String,
        required: 'Debe proporcionar un nombre para el tipo de producto'
    },
    price: {
        type: Number,
        required: 'Debe proporcionar un precio para el producto'
    },
    discount: {
        type: Number
    }
}, { versionKey: false })

const Footer = new Schema({
    subtotal: {
        type: Number
    },
    discounts: {
        type: Number
    },
    taxes: {
        type: Number
    }
}, { versionKey: false })

const DocumentSchema = new Schema({
    header: {
        type: Schema.Types.ObjectId, ref: 'Header'
    },
    details: {
        type: Schema.Types.ObjectId, ref: 'Details'
    },
    footer: {
        type: Schema.Types.ObjectId, ref: 'Footer'
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

module.exports = mongoose.model('Document', DocumentSchema)