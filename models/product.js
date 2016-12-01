'use strict';
const mongoose = require('mongoose')
const Brand = require('./brand')
const Schema = mongoose.Schema
// Estrablece las promesas de mongoose como promesas nativas de javascript
mongoose.Promise = global.Promise

const PriceList = new Schema({
    cost: {
        type: Number
    }
},{
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
    price: Number,
    components: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    priceList: {
        type: Schema.Types.Object,
        ref: 'PriceList'
    },
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
		default: Date()
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