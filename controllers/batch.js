'use strict';
const Batch = require('../models/batch')
const message = require('../services/response/message')

function getAllBatchs(request, response) {
    Batch.find({})
        .then(batchs => message.success(response, 200, '', batchs))
        .catch(error => message.failure(reponse, 422, '', null))
}

function retrieveAllBatchs(request, response) {
    let limit = parseInt(request.body.limit)
    let fields = request.body.fields
    let filter = request.body.filter
    let sort = request.body.sort

    Batch.find(filter)
        .select(fields)
        .limit(limit)
        .sort(sort)
        .then(batchs => message.success(response, 200, '', batchs))
        .catch(error => message.failure(response, 404, 'No se recupero el lote', null))
}

function checkBatch(request) {
    request.checkBody('name', 'Debe especificar un nombre de lote')
        .notEmpty()
    request.checkBody('dateExpiration', 'Debe especificar una fecha de vencimiento')
        .notEmpty()
}

function createBatch(request, response) {
    checkBatch(request)

    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                if (!result.isEmpty()) {
                    let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
                    return Promise.reject({ code: 422, message: messages, data: null })
                }
                return Promise.resolve()
            }
        })
        .then(() => {
            let newBatch = new Batch(request.body)
            newBatch.createdBy = request.decoded.username
            newBatch.business = request.decoded.business
            return newBatch.save()
        })
        .then(batch => {
            message.success(response, 200, 'Lote creado con éxito', { id: batch })
        })
        .catch(error => {
            if (error.code && error.code === 11000) {
                let error = { code: 422, message: 'El lote ya existe', data: null }
                message.failure(response, error.code, error.message, error.data)
            } else if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, 'No se pudo crear el lote', null)
            }
        })
}

function findBatch(batchId) {
    return Batch.findById({_id: batchId})
}

function getBatch(request, response) {
    findBatch(request.params.batchId)
        .then(batch => {
            if (batch) {
                return Promise.resolve(batch)
            } else {
                let error = {code: 404, message: 'No se encontró el lote', data: null}
                return Promise.reject(error)                
            }
        })
        .then(batch => {
            message.success(response, 200, 'Lote obtenido con éxito', batch)
        })
        .catch(error => {
            message.success(response, error.code, error.message, error.data)
        })
}

function updateBatch(request, response) {
    findBatch(request.params.batchId)
        .then(batch => {
            if (batch) {
                let newBatch = request.body
                newBatch.updatedBy = request.decoded.username
                newBatch.updatedAt = Date()
                return Batch.update({_id: request.params.batchId},{$set: newBatch}, {runValidator: true})
            } else {
                return Promise.reject({code: 404, message:'No se encontró el lote', data: null})
            }
        })
        .then(() => {
            return findBatch(request.params.batchId)
        })
        .then(batch => {
            message.success(response, 200, 'El lote se ha actualizado con éxito', {id:batch._id})
        })
        .catch(error => {
            if (error.code === 11000) {
                message.failure(response, 422, 'El lote ya existe', null)
            } else {
                message.failure(response, error.code, error.message, error.dta)
            }
        })
}

function deleteBatch(request, response) {
    findBatch(request.params.batchId)
        .then(batch => {
            if (batch) {
                Batch.remove({_id: batch.id})
                    .then(batch => {
                        message.success(response, 200, 'lote eliminado con éxito', null)
                    })
                    .catch(error => {
                        message.failure(response, 200, 'No se pudo eliminar el lote')
                    })
            } else {
                message.failure(response, 404, 'El lote no es válido', null)
            }
        })
        .catch(error => {
            message.failure(response, 422, 'No se pudo recuperar el lote', null)
        })
}

module.exports = {
    getAllBatchs,
    retrieveAllBatchs,
    createBatch,
    getBatch,
    updateBatch,
    deleteBatch    
}        