'use strict';
const Person = require('../models/person')
const Brand = require('../models/brand')
const message = require('../services/response/message')
const mongoose = require('mongoose')
const flatten = require('flatten')

// Obtiene todas las marcas
function getAllBrands(request, response) {
  // console.log('BODY--', request.body)
  Brand.find({})
    .then(brands => {
      return Promise.all(brands.map(brand => {
        return Person.populate(brand, { path: 'suppliers' })
      }))
    })
    .then(brands => {
      message.success(response, 200, '', brands)
    })
    .catch(error => {
      console.error('ERROR--', error)
      message.failure(response, 404, 'No se pudo recuperar la marca', error)
    })
}

function retrieveAllBrands(request, response) {
  let limit = parseInt(request.body.limit)
  let fields = request.body.fields
  let filter = request.body.filter
  let sort = request.body.sort

  Brand.find(filter)
    .select(fields)
    .limit(limit)
    .sort(sort)
    .then(brands => {
      console.log('BRANDS--', brands)
      return Promise.all(brands.map(brand => {
        return Person.populate(brand, { path: 'suppliers' })
      }))
    })
    .then(brands => {
      message.success(response, 200, '', brands)
    })
    .catch(error => {
      console.log('ERROR--', error)
      message.failure(response, 404, 'No se pudieron recuperar las Marcas', error)
    })
}

// Crear una nueva marca
function createBrand(request, response) {
  //Crea una nueva instancia de marca con los parametros recibidos
  let newBrand = new Brand(request.body)

  newBrand.createdBy = request.decoded.username
  newBrand.save()
    .then(brand => {
      message.success(response, 200, 'Marca creada con éxito', { id: brand._id })
    })
    .catch(error => {
      if (error.code === 11000) {
        message.duplicate(response, 422, 'La marca ya existe', null)
      } else {
        message.error(response, 422, 'No se pudo crear la marca', error)
      }
    })
}
// Obtener una marca
function findBrand(brandId) {
  return Brand.findById({ _id: brandId })
}
// Obtener un usuario por su id
function getBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        Person.populate(brand, { path: 'suppliers' })
          .then(user => {
            message.success(response, 200, 'Marca obtenida con éxito', brand)
          })
          .catch(error => {
            message.error(response, 422, 'No se pudo recuperar ', error)
          })
      } else {
        message.failure(response, 404, 'No se encontró la marca', null)
      }
    })
    .catch(error => {
      message.error(response, 500, 'No se pudo recuperar la marca', error)
    })
}
// Actualizar una marca por su id
function updateBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      // Si la marca con el id proporcionado existe se actualiza con los datos proporcionados
      if (brand) {
        let newBrand = request.body
        newBrand.updatedBy = request.decoded.username
        newBrand.updatedAt = Date.now()
        findBrand(request.params.brandId)
          .then(result => {
            if (result) {
              Brand.update({ _id: request.params.brandId }, { $set: newBrand }, { runValidators: true })
                .then(result => {
                  message.success(response, 200, 'Marca actualizada con éxito', null)
                })
                .catch(error => {
                  if (error.code === 11000) {
                    message.duplicate(response, 422, 'La marca ya existe', null)
                  } else {
                    message.error(response, 422, 'No se pudo actualizar la marca', error)
                  }
                })
            } else {
              message.duplicate(response, 422, 'La marca ya existe', null)
            }
          })
          .catch(error => {
            message.error(response, 422, 'No se pudo actualizar la marca', error)
          })
      } else {
        message.failure(response, 404, 'La marca, no es una marca valida', null)
      }
    })
    .catch(error => {
      message.error(response, 422, 'No se pudo encontrar la marca', error)
    })
}
// Eliminar una marca por su id
function deleteBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        Brand.remove({ _id: brand.id })
          .then(brand => {
            message.success(response, 200, 'Marca eliminada con éxito', null)
          })
          .catch(error => {
            message.error(response, 422, '', error)
          })
      } else {
        message.failure(response, 404, 'La marca, no es una marca valida', null)
      }
    })
    .catch(error => {
      message.error(response, 500, 'No se pudo eliminar la marca', error)
    })
}
// Obtener una marca
function findSupplier(brandId) {
  return Person.findById({ _id: brandId })
}
// Obtener los proveedores de una marca
function getAllSuppliers(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        return Promise.resolve(brand)
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la marca', data: null })
      }
    })
    .then(brand => {
      message.success(response, 200, 'Proveedores obtenidas con éxito', { suppliers: brand.suppliers })
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}
// Agregar un proveedor a una marca
function addSupplier(request, response) {
  let promiseBrand = findBrand(request.params.brandId)
  let promiseSupplier = findSupplier(request.body.supplierId)
  Promise.all([promiseBrand, promiseSupplier])
    .then(values => {
      let brandId = null
      let supplierId = null
      if (values[0]) {
        brandId = values[0]._id
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la marca', data: null })
      }
      if (values[1]) {
        supplierId = values[1]._id
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró el proveedor', data: null })
      }
      return Brand.update({ _id: brandId }, { $push: { suppliers: supplierId } })
    })
    .then(() => {
      return findBrand(request.params.brandId)
    })
    .then(brand => {
      return Person.populate(brand, { path: 'suppliers' })
    })
    .then(brand => {
      message.success(response, 200, 'Proveedor agregado con éxito', brand.suppliers)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}
// remover un proveedor de una marca
function deleteSuppliers(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      let suppliersIds = JSON.parse(request.body.suppliers)
      let brandId = mongoose.Types.ObjectId(request.params.brandId)
      return Promise.all(suppliersIds.map(id => {
        let supplierId = mongoose.Types.ObjectId(id)
        return Brand.update({ _id: brandId }, { $pull: { suppliers: supplierId } })
      }))
    })
    .then(values => {
      return findBrand(request.params.brandId)
    })
    .then(brand => {
      message.success(response, 200, 'Proveedores eliminados con éxito', brand.suppliers)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

module.exports = {
  getAllBrands,
  retrieveAllBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  getAllSuppliers,
  addSupplier,
  deleteSuppliers
}