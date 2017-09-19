'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise

let CounterSchema = new Schema({
    name: {
        type: String,
        required: 'Debe indicar el nombre de la colección de datos',
        unique: true,
        index: true
    },
    start: {
        type: Number,
        required: 'Debe indicar el valor inicial del contador',
        default: 0
    },
    incrementBy: {
        type: Number,
        required: 'Debe indicar el incremento del contador',
        default: 1
    },
    value: {
        type: Number,
        default: null
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

module.exports = mongoose.model('Counter', CounterSchema)