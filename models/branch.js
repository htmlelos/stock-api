'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Establece las promesas de mongoose como las promesas nativas de javascript
mongoose.Promise = global.Promise

const AddressSchema = new Schema({
    province: {type: String},
    city: {type: String},
    street: {type: String}
})

const BranchSchema = new Schema({
    name: {
        type: String,
        required: 'Debe proporcionar el nombre de la sucursal',
        unique: true,
        index: true
    },
    address: {
        type: Schema.Types.ObjectId, 
        ref: 'AddressSchema'
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVO', 'INACTIVO'],
            message: 'El estado de la sucursal solo puede ser ACTIVO o INACTIVO'
        },
        required: 'Debe definir el estado de la sucursal'
    },
    createdBy: {
        type: String,
        required: true,
        default: 'anonimo'
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedBy: {
        type: String
    },
    updatedAt: {
        type: Date
    }
},{
    versionKey: false
})

module.exports = mongoose.model('Branch', BranchSchema)