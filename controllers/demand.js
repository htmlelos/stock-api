'use strict';
const Business = require('../models/business')
const Demand = require('../models/demand')
const Person = require('../models/person')
const Branch = require('../models/branch')
const Brand = require('../models/brand')
const Category = require('../models/category')
const Product = require('../models/product')
const Document = require('../models/document')
const Counter = require('../models/counter')
const message = require('../services/response/message')
const mongoose = require('mongoose')

function getAllDemands(request, response) {
  Demand.find({})
    .then(demands => { message.success(response, 200, '', demands) })
    .catch(error => { message.failure(response, 422, '', null) })
}

function retrieveAllDemands(request, response) {
  let limit = parseInt(request.body.limit)
  let fields = request.body.fields;
  let filter = request.body.filter;
  let sort = request.body.sort;

  Demand.find(filter)
    .select(fields)
    .limit(limit)
    .sort(sort)
    .then(demands => { message.success(response, 200, '', demands) })
    .catch(error => { message.failure(response, 404, 'No se recuperó la sucursal', null) })
}

function checkItem(request) {
  request.checkBody('dateDemand', 'Debe ingresar la fecha de solicitud')
    .notEmpty()
  request.checkBody('quantity', 'Debe ingresar la cantidad solicitada')
    .notEmpty()
  request.checkBody('product', 'Debe ingresar el producto solicitado')
    .notEmpty()
  request.checkBody('branch', 'Debe ingresar la sucursal que solicito el producto')
    .notEmpty()
  request.checkBody('supplier', 'Debe seleccionar el proveedor del producto')
    .notEmpty()
}

function checkDemand(request) {
  request.checkBody('name', 'Debe proporcionar un nombre de solicitud de compra')
    .notEmpty()
  request.checkBody('startDate', 'Debe proporcionar una fecha inicial del pedido')
    .notEmpty()
  request.checkBody('business', 'Debe indicar la empresa a la que pertenece la solicitud')
    .notEmpty()
}

function createDemand(request, response) {
  checkDemand(request)

  request.getValidationResult()
    .then(result => {
      if (!result.isEmpty()) {
        let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
        return Promise.reject({ code: 422, message: messages, data: null })
      }
      return Promise.resolve()
    })
    .then(() => {
      // Crea una nueva instancia de la Solicitud con los parametros
      let newDemand = new Demand(request.body)
      newDemand.createdBy = request.decoded.username
      return newDemand.save()
    })
    .then(demand => {
      message.success(response, 200, 'Solicitud creada con éxito', { id: demand._id })
    })
    .catch(error => {
      if (error.code && error.code === 11000) {
        let error = { code: 422, message: 'La solicitud de pedido ya existe' }
        message.failure(response, error.code, error.message, error.data)
      } else if (error.code) {
        message.failure(response, error.code, error.message, error.data)
      } else {
        messge.failure(response, 500, error.message, null)
      }
    })
}

const findDemand = (demandId) => {
  return Demand.findById({ _id: demandId })
}

const getDemand = (request, response) => {
  console.log('GET_DEMAND');
  let demandId = request.params.demandId
  findDemand(demandId)
    .then(demand => {
      if (demand) {
        return Promise.resolve(demand)
      } else {
        let error = { code: 404, message: 'No se encontró la solicitud', data: null }
        return Promise.reject(error)
      }
    })
    .then(demand => {
      return Product.populate(demand, { path: 'items.product' })
    })
    .then(demand => {
      return Brand.populate(demand, { path: 'items.product.brand' })
    })
    .then(demand => {
      return Category.populate(demand, { path: 'items.product.category' })
    })
    .then(demand => {
      return Branch.populate(demand, { path: 'items.branch' })
    })
    .then(demand => {
      return Person.populate(demand, { path: 'items.supplier' })
    })
    .then(demand => {
      message.success(response, 200, 'Solicitud obtenida con éxito', demand)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

const updateDemand = (request, response) => {
  let demandId = request.params.demandId
  findDemand(demandId)
    .then(demand => {
      if (demand) {
        let newDemand = request.body
        newDemand.username = request.decoded.username
        newDemand.updatedAt = Date.now()
        return Demand.update({ _id: demand._id }, { $set: newDemand }, { runValidators: true })
      } else {
        let error = { code: 404, message: 'No se encontró la solicitud' }
        return Promise.reject(error)
      }
    })
    .then(() => {
      return findDemand(demandId)
    })
    .then(demand => {
      return Product.populate(demand, { path: 'items.product' })
    })
    .then(demand => {
      return Brand.populate(demand, { path: 'items.product.brand' })
    })
    .then(demand => {
      return Category.populate(demand, { path: 'items.product.category' })
    })
    .then(demand => {
      return Branch.populate(demand, { path: 'items.branch' })
    })
    .then(demand => {
      return Person.populate(demand, { path: 'items.supplier' })
    })
    .then(demand => {
      message.success(response, 200, 'Solicitud actualizada con éxito', demand)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

const deleteDemand = (request, response) => {
  let demandId = request.params.demandId
  findDemand(demandId)
    .then(demand => {
      if (demand) {
        return Demand.remove({ _id: demand._id })
      } else {
        let error = { code: 404, message: 'No se encontró la solicitud', data: null }
        return Promise.reject(error)
      }
    })
    .then(() => {
      message.success(response, 200, 'Solicitud eliminada con éxito', null)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}


const addItem = (request, response) => {
  let demandId = request.params.demandId
  let item = request.body
  checkItem(request)

  request.getValidationResult()
    .then(result => {
      if (!result.isEmpty()) {
        let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
        return Promise.reject({ code: 422, message: messages, data: null })
      }
      return Promise.resolve()
    })
    .then(() => {
      return findDemand(demandId)
    })
    .then(demand => {
      if (demand) {
        return Demand.update({ _id: demand._id }, { $push: { items: item } })
      } else {
        let error = { code: 404, message: 'No se encontró la solicitud', data: null }
        return Promise.reject(error)
      }
    })
    .then((result) => {
      return findDemand(demandId)
    })
    .then(demand => {
      return Person.populate(demand, { path: 'items.supplier' })
    })
    .then(demand => {
      return Brand.populate(demand, { path: 'items.product.brand' })
    })
    .then(demand => {
      return Category.populate(demand, { path: 'items.product.category' })
    })
    .then(demand => {
      return Branch.populate(demand, { path: 'items.branch' })
    })
    .then(demand => {
      return Product.populate(demand, { path: 'items.product' })
    })
    .then(demand => {
      message.success(response, 200, 'Item agregado con éxito', demand.items)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

const deleteItem = (request, response) => {
  let demandId = request.params.demandId
  let itemId = request.body.demandId

  findDemand(demandId)
    .then(demand => {
      if (demand) {
        return Demand.update({ _id: demand._id }, { $pull: { 'items': { id: itemId } } })
      } else {
        let error = { code: 404, message: 'No se encontró la solicitud', data: null }
        return Promise.reject(error)
      }
    })
    .then((result) => {
      return findDemand(demandId)
    })
    .then(demand => {
      return Product.populate(demand, { path: 'items.product' })
    })
    .then(demand => {
      return Brand.populate(demand, { path: 'items.product.brand' })
    })
    .then(demand => {
      return Category.populate(demand, { path: 'items.product.category' })
    })
    .then(demand => {
      return Branch.populate(demand, { path: 'items.branch' })
    })
    .then(demand => {
      return Person.populate(demand, { path: 'items.supplier' })
    })
    .then(demand => {
      message.success(response, 200, 'Item eliminado con éxito', demand.items)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

const deleteSelectedItems = (request, response) => {
  let demandId = request.params.demandId
  let items = request.body;
  findDemand(demandId)
    .then(demand => {
      if (demand) {
        return Promise.all(items.map(id => {
          return Demand.update({ _id: demandId }, { $pull: { items: { _id: id } } })
        }))
      } else {
        let error = { code: 404, message: 'No se encontró la solicitud', data: null }
        return Promise.reject(error)
      }
    })
    .then(() => {
      return findDemand(demandId)
    })
    .then(demand => {
      return Product.populate(demand, { path: 'items.product' })
    })
    .then(demand => {
      return Brand.populate(demand, { path: 'items.product.brand' })
    })
    .then(demand => {
      return Category.populate(demand, { path: 'items.product.category' })
    })
    .then(demand => {
      return Branch.populate(demand, { path: 'items.branch' })
    })
    .then(demand => {
      return Person.populate(demand, { path: 'items.supplier' })
    })
    .then(demand => {
      message.success(response, 200, 'Items seleccionados eliminados con éxito', demand.items)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

const generateOrder = (request, response) => {
<<<<<<< HEAD
  let demandId = request.params.demandId
  let userId = request.decoded._id
  let promiseDemand = Demand.findById({ _id: demandId })
  let promisePerson = Person.findOne({ user: mongoose.Types.ObjectId(request.decoded._id) })
  let promiseCounter = Counter.findOne({ type: 'ORDEN', business: request.decoded.business })
  let counterValue = 0;
  let orders = []
  Promise.all([promiseDemand, promisePerson, promiseCounter])
    .then(values => {
      let demand = values[0]
      let sender = values[1]
      let counter = values[2]
      let items = {}
      if (!sender) {
        let error = { code: 404, message: 'El usuario no posee permisos para realizar esta operacion' }
        return Promise.reject(error)
      }
      if (demand.status === 'GENERADO') {
        let error = { code: 422, message: 'No se puede generar una orden si el pedido ya fue generado' }
        return Promise.reject(error)
      }
      if (counter === null) {
        let error = { code: 422, message: 'No se pudo obtener el numero de orden' }
        return Promise.reject(error)
      }
      demand.items.map(item => {
        if (!items[item.supplier]) {
          items[item.supplier] = []
        }
        items[item.supplier].push({
          quantity: item.quantity,
          product: item.product
        })
      })
      counterValue = counter.value
      for (let key in items) {
        if (items.hasOwnProperty(key)) {
          let element = items[key]
          let order = new Document({
            documentType: 'ORDEN',
            documentName: 'Orden de Compra',
            documentDate: Date.now(),
=======
    let demandId = request.params.demandId
    let userId = request.decoded._id
    let promiseDemand = Demand.findById({ _id: demandId })
    let promisePerson = Person.findOne({ user: mongoose.Types.ObjectId(request.decoded._id) })
    let promiseCounter = Counter.findOne({ type: 'ORDEN', business: request.decoded.business })
    let counterValue = 0;
    let orders = []
    Promise.all([promiseDemand, promisePerson, promiseCounter])
        .then(values => {
            let demand = values[0]
            let sender = values[1]
            let counter = values[2]
            let items = {}
            if (!sender) {
                let error = {code: 404, message: 'El usuario no posee permisos para realizar esta operacion'}
                return Promise.reject(error)
            }
            if (demand.status === 'GENERADO') {
                let error = {code: 422, message: 'No se puede generar una orden si el pedido ya fue generado'}
                return Promise.reject(error)              
            }
            if (counter === null) {
                let error = {code:422, message: 'No se pudo obtener el numero de orden'}
                return Promise.reject(error)
            }
            demand.items.map(item => {
                if (!items[item.supplier]) {
                    items[item.supplier] = []
                }
                items[item.supplier].push({
                    quantity: item.quantity,
                    product: item.product
                })
            })
            counterValue = counter.value
            for (let key in items) {
                if (items.hasOwnProperty(key)) {
                    let element = items[key]
                    let order = new Document({
                        documentType: 'ORDEN',
                        documentName: 'Orden de Compra',
                        documentDate: Date.now(),
                        documentOrigin: demandId,
>>>>>>> 35e47a540d0801453cc1cb98d9c77aca58dca61f

            business: request.decoded.business,
            receiver: key,
            sender: sender._id
          })


          element.forEach(element => {
            // let detail = element
            order.documentNumber = counterValue
            order.detail.push(element)
            counterValue++
          }, this)
          orders.push(order)
        }
      }
    })
    .then((result) => {
      return Counter.update({ name: 'orden' }, { $set: { value: counterValue } })
    })
    .then(() => {
      return Demand.update({ _id: demandId }, { $set: { status: 'GENERADO', updatedBy: request.decoded.username, updatedAt: Date.now() } })
    })
    .then(() => {
      return Promise.all(orders.map(order => order.save()))
    })
    .then(result => {
      message.success(response, 200, 'Ordenes generadas con exito', orders)
    })
    .catch(error => {
      console.log('ERROR--', error);
      message.failure(response, error.code, error.message, error.data)
    })
}

const listOrders = (request, response) => {
  let demandId = request.params.demandId
  let business = request.decoded.business

  let query = {
    "documentType": 'ORDEN',
    "$and": [
      {"business": mongoose.Types.ObjectId(business)},
      {"$and":[
        {"documentOrigin":mongoose.Types.ObjectId(demandId)}
      ]}
    ]
  }

  Document.find(query)
   .then(document => {
     return Demand.populate(document, {path: 'documentOrigin'})
   })
   .then(document => {
     return Business.populate(document, {path: 'business'})
    })
    .then(document => {
      return Person.populate(document, {path:'receiver'})
    })
    .then(document => {
      return Person.populate(document, {path: 'sender'})
    })
    .then(document => {      
      message.success(response, 200, 'Ordenes obtenidas con éxito', document)
   })
   .catch(error => {
     message.failure(response, 404, 'No se encontro la solicitud', null)
   })

}

module.exports = {
  getAllDemands,
  retrieveAllDemands,
  createDemand,
  getDemand,
  updateDemand,
  deleteDemand,
  addItem,
  deleteItem,
  deleteSelectedItems,
  generateOrder,
  listOrders
}