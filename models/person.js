'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas nativas como libreria de promesas para mongoose
mongoose.Promise = global.Promise

const AddressSchema = new Schema({
    address: {
        type: String
    }
}, {
        versionKey: false
    })

const ContactSchema = new Schema({
    name: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    }
}, {
        versionKey: false
    })

const PersonSchema = new Schema({
    type: {
        type: String,
        enum: {
            values: ['CLIENTE', 'PROVEEDOR', 'VENDEDOR', 'CAJERO', 'ORDENANTE'],
            message: 'El tipo de persona solo puede ser o CLIENTE, PROVEEDOR, VENDEDOR, CAJERO u ORDENANTE'
        },
        required: 'Debe proporcionar un tipo de persona'
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    businessName: {
        type: String
    },
    addresses: [AddressSchema],
    tributaryCode: {
        type: String
    },
    taxStatus: {
        type: String,
        enum: {
            values: ['RESPONSABLE INSCRIPTO', 'RESPONSABLE NO INSCRIPTO', 'MONOTRIBUTO', 'EXENTO'],
            message: 'El estado de la persona solo puede ser RESPONSABLE INSCRIPTO, RESPONSABLE NO INSCRIPTO, MONOTRIBUTO o EXENTO'
        }
    },
    grossIncomeCode: {
        type: String,
    },
    contacts: [ContactSchema],
    status: {
        type: String,
        enum: {
            values: ['ACTIVO', 'INACTIVO'],
            message: 'El estado de la persona solo puede ser ACTIVO o INACTIVO'
        },
        required: 'Debe definir el estado del proveedor'
    },
    business: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        required: 'Debe indicar la empresa a la que pertenece'
    },
    user: {
        type: Schema.Types.Object,
        ref: 'User'
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

PersonSchema.virtual('fullname').get(function () {
    return `${this.firstName} ${this.lastName}`
})

module.exports = mongoose.model('Person', PersonSchema)