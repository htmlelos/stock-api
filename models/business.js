'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas de mongoose como las promesas nativas de javascript
mongoose.Promise = global.Promise

const BusinessSchema = new Schema({
    name: {
        type: String,
        required: 'Debe proporcionar un nombre de la empresa',
        unique: true,
        index: true
    },
    cuit: {
        type: String,
        required: 'Debe proporcionar un numero de cuit',
        unique: true,
        index: true
    },    
    status: {
        type: String,
        enum: {
            values: ['ACTIVO', 'INACTIVO'],
            message: 'El estado de la empresa solo puee ser ACTIVO, INACTIVO'
        },
        required: 'Debe definir el estado de la empresa'
    },
    createdBy: {
        type: String,
        required: true,
        default: 'anonimo'
    },
    createdAt: {
        type: string,
        required: true,
        default: Date.now
    },
    updatedBy: {
        type: String,        
    },
    updatedAt: {
        type: Date
    }
} , {
    versionKey: false
})

module.exports = mongoose.model('Business', BusinessSchema)