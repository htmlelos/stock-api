'use strict';
const mongoose = require('mongoose')
// const Deposit = require('../models/deposit')
const Business = require('../models/Business')
const message = require('../services/response/messages')

function populateAll(business) {
    return Promise.all(business.map(bussiness => {
        return Bussiness.populate(business, {path: 'warehouses'})
    }))
}

function getAllBussinesses(request, response) {
    Business.find({})
        .then(business => {return populateAll(business)})
        .then(business => {message.success})
}