'use strict';
const Supplier = require('../models/supplier')
const message = require('../services/response/message')

//Obtener todos los proveedores
function getAllSupliers(request, response) {

  Supplier.find({})
    .then(suppliers => {
      message.success(response, 200, '', suppliers)
    })
    .catch(error => {
      message.error(response, 422, '', error)
    })
}
// Crea un nuevo proveedor
function createSupplier(request, response) {
  //Crea una nueva instancia de proveedor con los parametros recibidos
  let newSupplier = new Supplier(request.body)

  newSupplier.save()
    .then(supplier => {
      message.success(response, 200, 'Proveedor creado con exito', null)
    })
    .catch(error => {
      if (error.code === 11000) {
        message.error(response, 422, 'El proveedor ya existe', error)
      } else {
        message.error(response, 422, 'No se pudo crear el usuario', error)
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
        message.success(response, 200, 'Proveedor obtenido con exito', supplier)
      } else {
        message.failure(response, 404, 'No se encontro el proveedor', null)
      }
    })
    .catch(error => {
      message.error(response, 422, 'No se pudo recuperar el proveedor', error)
    })
}
// Actualiza el proveedor
function updateSupplier(request, response) {
  // Encuentra el proveedor a actualizar
  findSupplier(request.params.supplierId)
    .then(supplier => {
      // Si le proveedor existe se actualiza con los datos proporcionados
      if (supplier) {
        let newSupplier = request.body
        newSupplier.updatedBy = request.decoded.username
        newSupplier.updatedAt = Date.now()
        Supplier.update({ _id: request.params.userId }, { $set: newSupplier })
          .then(supplier => {
            message.success(response, 200, 'Proveedor actualizado con exito', null)
          })
          .catch(error => {
            if (error.code === 11000) {
              message.duplicate(response, 422, 'El proveedor ya existe', null)
            } else {
              message.error(response, 422, '', error)
            }
          })
      } else {
        message.failure(response, 404, 'El proveedor, no es un proveedor valido', null)
      }
    })
    .catch(error => {
      message.error(response, 422, 'No se pudo actualizar el proveedor', error)
    })
}
// Elimina un proveedor
function deleteSupplier(request, response) {
  findSupplier(request.params.supplierId)
    .then(supplier => {
      if (supplier) {
        Supplier.remove({ _id: supplier.id })
          .then(supplier => {
            message.success(response, 200, 'Proveedor eliminado con exito', null)
          })
          .catch(error => {
            message.error(response, 422, '', error)
          })
      } else {
        message.failure(response, 404, 'El proveedor, no es un proveedor valido', null)
      }
    })
    .catch(error => {
      message.error(response, 422, 'No se pudo eliminar el proveedor', error)
    })
}

module.exports = {
  getAllSupliers,
  createSupplier,
  getSupplier,
  updateSupplier,
  deleteSupplier
}
