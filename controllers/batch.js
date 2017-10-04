'use strict';
const Batch = require('../models/batch')
const message = require('../services/response/message')

function getAllBatchs(request, response) {
    Batch.find({})
        .then(batchs => message.success(response, 200, '', batchs))
        .catch(error => message.failure(reponse, 422, '', null))
}        

function retrieveAllBatchs(request, response) {
    let limit = parseInt(request, respose)
    let field = request.body.field
    let filter = request.body.filter
    let sort = request.body.sort

    Batch.find(filter)
        .select(fields)
        .limit(limit)
        .sort(sort)
        .then(batchs => message.success(request, 200, '', batchs))
        .catch(error => message.failure(response, 404, 'No se recupero el lote', null))
}

module.exports = {
    getAllBatchs,
    retrieveAllBatchs
}        