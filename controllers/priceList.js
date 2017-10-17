'use strict';
const PriceList = require('../models/priceList')
const message = require('../services/response/message')

// Obtener todas las Listas de Precios
function getAllPriceLists(request, response) {
  PriceList.find({})
    .then(priceList => {
      message.success(response, 200, '', priceList)
    })
    .catch(error => {
      message.failure(response, 422, '', error)
    })
}
function retrieveAllPriceList(request, response) {
  let limit = parseInt(request.body.limit)
  let fields = request.body.fields
  let filter = request.body.filter
  let sort = request.body.sort

  PriceList.find(filter)
    .select(fields)
    .limit(limit)
    .sort(sort)
    .then(priceLists => {
      message.success(response, 200, '', priceLists)
    })
    .catch(error => {
      message.failure(response, 404, 'No se pudieron recuperar las Listas de precios', error)
    })
}

function checkPriceList(request) {
  request.checkBody('name', 'Debe proporcionar un nombre para la lista de precios')
    .notEmpty()
  request.checkBody('description', 'Debe proporcionar una descripción para la lista de precios')
    .notEmpty()
  request.checkBody('status', 'Debe proporcionar el estado de la Lista de Precios')
    .notEmpty()
  request.checkBody('status', 'La Lista de Precios solo puede estar en estado ACTIVO o INACTIVO')
    .isIn('ACTIVO','INACTIVO')
  request.checkBody('business', 'Debe indicar la empresa a la que pertenece la lista de precios')
    .notEmpty()
}
// Crea una nueva lista de Precios
function createPriceList(request, response) {
  checkPriceList(request)

    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
                return Promise.reject({ code: 422, message: messages, data: null })
            }
            return Promise.resolve()
        })
        .then(() => {          
          // Crea una nueva instancia de PriceList con los parametros recibidos
          let newPriceList = new PriceList(request.body)
          newPriceList.createdBy = request.decoded.username
          newPriceList.business = request.decoded.business
          return newPriceList.save()
        })
        .then(priceList => {
          message.success(response, 200, 'Lista de Precios creada con éxito', { id: priceList._id })
        })
      .catch(error => {
        if (error.code && error.code === 11000) {
          let error = {code: 422, message: 'La Lista de Precios ya existe', data: null}
          message.failure(response, error.code, error.message, error.data)
        } else if (error.code) {
          message.failure(response, error.code, error.message, error.data)
        } else {
          message.failure(response, 500, 'No se pudo crear la lista de precios', null)
        }
      })
}
// Buscar un rol
function findPriceList(pricelistId) {
  return PriceList.findById({ _id: pricelistId })
}

function getPriceList(request, response) {
  findPriceList(request.params.pricelistId)
    .then(priceList => {
      if (priceList) {
        message.success(response, 200, 'Lista de Precios obtenida con éxito', priceList)
      } else {
        message.failure(response, 404, 'No se encontró la Lista de Precios', null)
      }
    })
    .catch(error => {
      message.failure(response, 500, 'El sistema tuvo un fallo al recuperar la lista de precios, contactar al adminstrador del sistema', error)
    })
}

function updatePriceList(request, response) {
  let priceListId = request.params.pricelistId
  findPriceList(priceListId)
    .then(priceList => {
      if (priceList) {
        let newPriceList = request.body
        newPriceList.updatedBy = request.decoded.username
        newPriceList.updatedAt = Date()
        return PriceList.update({ _id: request.params.pricelistId }, { $set: newPriceList }, { runValidators: true })
      } else {
        let error = {code: 404, message: 'La Lista de Precios no es valida', data: null}
        return Promise.reject(error)
      }
    })
    .then(() => {
      return findPriceList(priceListId)
    })
    .then(priceList => {
      message.success(response, 200, 'Lista de Precios actualizada con éxito', null)
    })
    .catch(error => {
      if (error.code && error.code === 11000) {
        let error = { code: 422, message: 'La lista de precios ya existe', data: null }
        message.failure(response, error.code, error.message, error.data)
      } else if (error.code) {
        message.failure(response, error.code, error.message, error.data)
      } else {
        message.failure(response, 500, 'No se pudo actualizar la Lista de Precios', null)
      }
    })
}

function deletePriceList(request, response) {
  findPriceList(request.params.pricelistId)
    .then(priceList => {
      if (priceList) {
        PriceList.remove({ _id: priceList._id })
          .then(result => {
            message.success(response, 200, 'Lista de Precios eliminada con éxito', null)
          })
          .catch(error => {
            message.failure(response, 422, '', error)
          })
      } else {
        message.failure(response, 404, 'La Lista de Precios no es valida', null)
      }
    })
    .catch(error => {
      message.failure(response, 422, 'No se pudo recuperar la lista de precios', error)
    })
}

module.exports = {
  getAllPriceLists,
  retrieveAllPriceList,
  createPriceList,
  getPriceList,
  updatePriceList,
  deletePriceList
}