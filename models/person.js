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
    phone: {
        type: String
    },
    name: {
        type: String
    }
}, {
        versionKey: false
    })

const PersonSchema = new Schema({
    type: {
        type: String,
        enum: {
            values: ['CLIENTE', 'PROVEEDOR', 'VENDEDOR', 'CAJERO'],
            message: 'El tipo de persona solo puede ser o CLIENTE, PROVEEDOR, VENDEDOR o CAJERO'
        },
        required: 'Debe proporcionar un tipo de persona'
    },
    firstName: {
        type: String,
        required: 'Debe proporcionar el nombre de la persona'
    },
    lastName: {
        type: String,
        required: 'Debe proporcionar el apellido de la persona'
    },
    address: [AddressSchema],
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

module.exports = mongoose.model('person', PersonSchema)