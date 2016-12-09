'use strict';
const Supplier = require('../models/supplier')
const message = require('../services/response/message')

//Obtener todos los proveedores
function getAllSupliers(request, response) {

  Supplier.find({})
    .then(suppliers => {
      message.success(response, {
        status: 200,
        message: '',
        data: suppliers
      })
    })
    .catch(error => {
      // console.log('--ERROR-422--', error);
      message.error(response, {
        status: 422,
        message: '',
        data: error
      })
    })
}
// Crea un nuevo proveedores
function createSupplier(request, response) {
  //Crea una nueva instancia de proveedor con los parametros recibidos
  let newSupplier = new Supplier(request.body)

  newSupplier.save()
    .then(supplier => {
      message.success(response, {status: 200, message: 'Proveedor creado con exito', data: null})
    })
    .catch(error => {
      // console.log('--ERROR-422--', error);
      if (error.code === 11000) {
        message.error(response, {status: 422, message: 'El proveedor ya existe', data: error})
      } else {
        message.error(response, { status: 422, message: '', data: error})
      }
    })
}
// Obtener un proveedor
function findSupplier(supplierId) {
    return Supplier.findById({ _id: supplierId })
}
//Obtener un proveedor por su id
function getSupplier(request, response) {
  findSupplier(request.params.supplierId)
    .then(supplier => {
      if (supplier) {
        message.success(response, {status: 200, message: 'Proveedor obtenido con exito', data: supplier})
      } else {
        message.failure(response, {status: 404, message: 'No se encontro el proveedor', data: null})
      }
    })
    .catch(error => {
      message.error(response, {stauts: 422, message: '', data: error})
    })
}
// Asigna el nuevo dato o el proveedor
function assignSupplier(oldValue, newValue) {
  return Object.assign(oldValue, newValue).save()
}
// Actualiza el proveedor
function updateSupplier(request, response) {
  // Encuentra el proveedor a actualizar
  findSupplier(request.params.supplierId)
    .then(supplier => {
      // Si le proveedor existe se actualiza con los datos proporcionados
      if (supplier) {
        let newSupplier = request.body
        newSupplier.updatedBy = global.currentUser.username
        newSupplier.updatedAt = Date()
        assignSupplier(supplier, newSupplier)
          .then(supplier => {
            message.success(response, { status: 200, message: 'Proveedor actualizado con exito', data: null})
          })
          .catch(error => {
            if (error.code === 11000) {
              message.duplicate(response, {status: 422, message: 'El proveedor ya existe', data: null})
            } else {
              message.error(response, { status: 422, message: '', data: error})
            }
          })
      } else {
        message.failure(response, { status: 404, message: 'El proveedor, no es un proveedor valido', data: null})
      }
    })
    .catch(error => {
      message.error(response, { status: 422, message: '', data: error})
    })
}
// Elimina un proveedor
function deleteSupplier(request, response) {
  findSupplier(request.params.supplierId)
    .then(supplier => {
      if (supplier) {
        Supplier.remove({_id: supplier.id})
          .then(supplier => {
            message.success(response, {status: 200, message: 'Proveedor eliminado con exito', data: null})
          })
          .catch(error => {
            message.error(response, {status: 422, message: '', data: error})
          })
      } else {
        message.failure(response, {status: 404, message: 'El proveedor, no es un proveedor valido', data: null})
      }
    })
    .catch(error => {
      message.error(response, {status: 422, message:'', data: error})
    })
}

module.exports = {
  getAllSupliers,
  createSupplier,
  getSupplier,
  updateSupplier,
  deleteSupplier
}
