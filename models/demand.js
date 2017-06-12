'use strict';
const mongoose = require('mongoose')
// const Product = require('./Product')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise

const ItemSchema = new Schema({
    dateDemand: {
        type: Date,
        default: Date.now(),
        required: 'Debe ingresar la fecha de solicitud',
        index: true
    },
    quantity: {
        type: Number,
        required: 'Debe ingresar la cantidad solicitada'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: 'Debe ingresar el producto solicitado',
        index: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: 'Debe ingresar la sucursal que solicito el producto',
        index: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: 'Debe seleccionar el proveedor del producto',
        index: true
    }
})

const DemandSchema = new Schema({
    name: {
        type: String,
        required: 'Debe proporcionar un nombre de solicitud de compra',
        unique: true,
        index: true
    },
    startDate: {
        type: Date,
        required: 'Debe proporcionar una fecha inicial del pedido',
        unique: true,
        index: true,
        default: Date.now()
    },
    items: [ItemSchema],
    createdBy: {
        type: String,
        required: 'Debe proporcionar el usuario que creo el registro' ,
        default: 'anonimo'
    },
    createdAt: {
        type: Date,
        required: 'Debe proporcionar una fecha de creacion',
        default: Date.now()
    },
    updatedBy: {
        type: String
    },
    updatedAt: {
        type: Date
    }
}, {
        versionKey: false
    })

module.exports = mongoose.model('Demand', DemandSchema)