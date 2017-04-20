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
      message.error(response, 422, '', error)
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
// Crea una nueva lista de Precios
function createPriceList(request, response) {
  // Crea una nueva instancia de PriceList con los parametros recibidos
  let newPriceList = new PriceList(request.body)

  newPriceList.createdBy = request.decoded.username
  newPriceList.save()
    .then(priceList => {
      message.success(response, 200, 'Lista de Precios creada con éxito', { id: priceList._id })
    })
    .catch(error => {
      if (error.code === 11000) {
        message.duplicate(response, 422, 'La Lista de Precios ya existe', null)
      } else {
        message.error(response, 422, '', error)
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
      message.error(response, 500, 'El sistema tuvo un fallo al recuperar la lista de precios, contactar al adminstrador del sistema', error)
    })
}

function updatePriceList(request, response) {
  findPriceList(request.params.pricelistId)
    .then(priceList => {
      if (priceList) {
        let newPriceList = request.body
        newPriceList.updatedBy = request.decoded.username
        newPriceList.updatedAt = Date()
        PriceList.update({ _id: request.params.pricelistId }, { $set: newPriceList }, { runValidators: true })
          .then(result => {
            message.success(response, 200, 'Lista de Precios actualizada con éxito', null)
          })
          .catch(error => {
            if (error.code === 11000) {
              message.duplicate(response, 422, 'La lista de precios ya existe', null)
            } else {
              message.error(response, 500, 'No se pudo actualizar la Lista de Precios', error)
            }
          })
      } else {
        message.failure(response, 404, 'La Lista de Precios no es valida', null)
      }
    })
    .catch(error => {
      message.error(response, 500, 'No se pudo actualizar la Lista de Precios', error)
    })
}

function deletePriceList(request, response) {
  findPriceList(request.params.pricelistId)
  .then(priceList => {
    if (priceList) {
    PriceList.remove({_id: priceList._id})
      .then(result => {
        message.success(response, 200, 'Lista de Precios eliminada con éxito', null)
      })
      .catch(error => {
        message.error(response, 422, '', error)
      })
    } else {
      message.failure(response, 404, 'La Lista de Precios no es valida', null)
    }
  })
  .catch(error => {
    message.error(response, 422, 'No se pudo recuperar la lista de precios', error)
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