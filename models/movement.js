'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise
let MovementSchema = new Schema({
    type: {
        type: String,
        enum: {
            values: ['INGRESO', 'EGRESO']
        },
        required: 'Debe proporcionar un tipo de movimiento'
    },
    origin: {
        type: {
            type: Schema.Types.ObjectId,
            ref: 'Branch'
        }
    },
    destination: {
        type: {
            type: Schema.Types.ObjectId,
            ref: 'Branch'
        }
    },
    batchCode: {
        type: String
    },
    dateMovement: {
        type: Date,
        required: 'Debe proporcionar la fecha de movimiento'
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    createdBy: {
        type: String,
        require: true,
        default: 'anonimo'
    },
    updateAt: {
        type: Date
    },
    updateBy: {
        type: String
    }
},{
    versionKey: false
})

module.exports = mongoose.model('Movement', MovementSchema)