'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise

const BatchSchema = new Schema({
    name: {
        type: String,
        required: 'Debe especificar un nombre de lote',
        unique: true,
        index: true
    },
    dateExpiration: {
        type: Date,
        required: 'Debe especificar una fecha de vencimiento',
        index: true
    },
    business: {
		type: Schema.Types.ObjectId,
		ref: 'Business'        
    },
    createdBy: {
        type: String,
        requierd: true,
        default: 'anonimo'
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updateBy: {
        type: String
    },
    updateAt: {
        type: Date
    }
},{
    versionKey: false
})

module.exports = mongoose.model('Batch', BatchSchema)