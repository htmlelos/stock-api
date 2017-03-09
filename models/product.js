'use strict';
const mongoose = require('mongoose')
const Brand = require('./brand')
const Schema = mongoose.Schema
// Establece las promesas nativas como libreria de promesas para mongoose
mongoose.Promise = global.Promise

const PriceSchema = new Schema({
    priceListId: {
        type: Schema.Types.ObjectId,
        ref: 'PriceList'
    },
    cost: {
        type: Number
    },
    profit: {
        type: Number
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVO', 'INACTIVO'],
            message: 'El estado del precio de un producto solo puede ser ACTIVO o INACTIVO'
        },
        required: 'Debe definir el estado del producto'        
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: String,
        default: 'anonimo'
    }
}, {
        versionKey: false
    })

const ProductSchema = new Schema({
    name: {
        type: String,
        required: 'Debe proporcionar un nombre de producto',
        unique: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'Brand'
    },
    code: String,
    components: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    priceLists: [PriceSchema],
    status: {
        type: String,
        enum: {
            values: ['ACTIVO', 'INACTIVO'],
            message: 'El estado de un usuario solo puede ser ACTIVO o INACTIVO'
        },
        required: 'Debe definir el estado del producto'
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
    modifiedAt: {
        type: Date
    },
    modifiedBy: {
        type: String
    }
}, {
        versionKey: false
    })

module.exports = mongoose.model('product', ProductSchema)