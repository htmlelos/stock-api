'use strict';
const mongoose = require('mongoose')
const Movement = require('../models/movement')
const message = require('../services/response/message')
// Obtiene todos los movimientos
function getAllMovements(request, response) {
    Movement.find({})
        .then(movements => message.success(response, 200, '', movements))
        .catch(error => message.failure(response, 404, 'No se pudieron recuperar los movimientos', error))
}
// Obtener todos los movimientos que cumplan con los criterios espeficicados
function retrieveAllMovements(request, response) {
    let limit = parseInt(request.body.limit)
    let fields = request.body.fields
    let filter = request.body.filter
    let sort = request.body.sort

    Movement.find(filter)
        .select(fields)
        .limit(limit)
        .sort(sort)
        .then(movements => message.success(response, 200, '', movements))
        .catch(error => message.failure(response, 404, 'No se pudieron recuperar los movimientos', error))
}
// Valida los movimientos de productos
function checkMovement(request) {
    let type = request.body.type
    let kind = request.body.king
    request.checkBody('type', 'Debe definir el tipo de movimiento')
        .notEmpty()
    request.checkBody('type', 'El tipo de movimeinto solo puede ser INGRESO, EGRESO, TRANSFERENCIA, AJUSTE')
        .isIn(['INGRESO', 'EGRESO'])
    if (type === 'EGRESO') {
        request.checkBody('origin', 'Debe proporcionar el origen del moviemiento')
            .notEmpty()
        request.checkBody('batchCode', 'Debe proporcionar un codigo de lote')
            .notEmpty()
    }
    if (type === 'INGRESO') {
        request.checkBody('destination', 'Debe proporcionar el destino del moviemiento')
            .notEmpty()
    }
    if (kind === 'COMPRA' || kind === 'VENTA') {
        request.checkBody('documentOrigin', 'Debe indicar el documento que genero el movimiento')
            .notEmpty()
    }
    request.checkBody('kind', 'Debe proporcionar la clase de movimiento')
        .notEmpty()
    request.checkBody('kind', 'La clase de movimiento solo puede ser COMPRA, VENTA, TRANSFERENCIA o AJUSTE')
        .isIn(['COMPRA', 'VENTA', 'TRANSFERENCIA', 'AJUSTE'])
    request.checkBody('product', 'Debe proporcionar el producto del movimiento')
        .notEmpty()
    request.checkBody('quantity', 'Debe indicar la cantidad del movimiento')
        .notEmpty()
}
// Crea un nuevo movimiento
function createMovement(request, response) {
    checkMovement(request)

    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
                return Promise.reject({ code: 422, message: messages, data: null })
            }
            return Promise.resolve()
        })
        .then(() => {
            let newMovement = new Movement(request.body)
            newMovement.createdBy = request.decoded.username
            return newMovement.save()
        })
        .then(movement => {
            message.success(response, 200, 'Movimiento creado con éxito', { id: movement._id })
        })
        .catch(error => {
            if (error.code && error.code === 11000) {
                let error = { code: 422, message: 'El movimiento ya existe', data: null }
                message.failure(response, error.code, error.message, error.data)
            } else if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, error.message, null)
            }
        })
}

function findMovement(movementId) {
    return Movement.findById({ _id: movementId })
}

function getMovement(request, response) {
    findMovement(request.params.movementId)
        .then(movement => Movement.populate(movement, { path: 'product' }))
        .then(movement => Movement.populate(movement, { path: 'origin' }))
        .then(movement => Movement.populate(movement, { path: 'destination' }))
        .then(movement => message.success(response, 200, 'Movimiento obtenido con éxito', movement))
        .catch(error => {
            console.log('ERROR--', error);
            message.failure(response, error.code, error.message, error.data)
        })
}

function modifyMovement(movement, newMovement) {
    if (movement) {
        return Movement.update()
    }
}

function updateMovement(request, response) {
    let movementId = request.params.movementId
    let newMovement = request.body
    newMovement.updatedBy = request.decoded.username
    newMovement.updatedAt = Date.now()
    findMovement(movementId)
        .then(movement => modifyMovement(movement, newMovement))
        .then(() => findMovement(movementId))
        .then(movement => Movement.populate(movement, { path: 'product' }))
        .then(movement => Movement.populate(movement, { path: 'origin' }))
        .then(movement => Movement.populate(movement, { path: 'destination' }))
        .then(movement => message.success(response, 200, 'Movimiento actualizado', movement))
        .catch(error => {
            if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, error.message, error)
            }
        })
}

function addBatch(request, response) {
    let movementId = request.params.movementId
    let batchId = request.params.batchId
    findMovement(movementId)
        .then(movement => {
            if (movement) {
                return Movement.update({ _id: movementId }, { $set: { batchCode: batchId } })
            }
        })
        .then(() => {
            return Movement.findById(movementId)
        })
        .then(movement => {
            message.success(response, 200, 'Lote añadido a el movimiento', movement)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function deleteBatch(request, response) {
let movementId = request.params.movementId
let batchId = request.params.batchId
findMovement(movementId)
    .then(document => {
        if (document) {
            return Movement.update({_id: movement})
        }
    })
}

module.exports = {
    getAllMovements,
    retrieveAllMovements,
    createMovement,
    getMovement,
    updateMovement,
    addBatch,
    deleteBatch
}