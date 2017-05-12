'use strict';
const Person = require('../models/person')
const Brand = require('../models/brand')
const message = require('../services/response/message')
const mongoose = require('mongoose')

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
      message.failure(response, 404, 'No se pudieron recuperar las Marcas', error)
    })
}
// Verifica que el nombre de la marca esté presente
function checkName(request) {
  request.checkBody('name', 'Debe proporcionar un nombre para la marca')
    .notEmpty()
}
// Valida lo datos del estado de la marca
function checkStatus(request) {
  request.checkBody('status', 'Debe definir el estado de la Marca')
    .notEmpty()
  request.checkBody('status', 'El estado de la Marca solo puede ser ACTIVO o INACTIVO')
    .isIn('ACTIVO', 'INACTIVO')
}
// Crear una nueva marca
function createBrand(request, response) {
  checkName(request)
  checkStatus(request)

  request.getValidationResult()
    .then(result => {
      if (!result.isEmpty()) {
        let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
        return Promise.reject({ code: 422, message: messages, data: null })
      }
      return Promise.resolve()
    })
    .then(() => {
      //Crea una nueva instancia de marca con los parametros recibidos
      let newBrand = new Brand(request.body)
      newBrand.createdBy = request.decoded.username
      return newBrand.save()
    })
    .then(brand => {
      message.success(response, 200, 'Marca creada con éxito', { id: brand._id })
    })
    .catch(error => {
      if (error.code && error.code === 11000) {
        let error = { code: 422, message: 'La Marca ya existe', data: null }
        message.failure(response, error.code, error.message, error.data)
      } else if (error.code) {
        message.failure(response, error.code, error.message, error.data)
      } else {
        message.error(response, 500, error.message, error)
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
function modifyBrand(brand, newBrand) {
  if (brand) {
    return Brand.update({ _id: brand._id }, { $set: newBrand })
  } else {
    let error = { code: 404, message: 'La Marca no es válida', data: null }
    return Promise.reject(error)
  }
}
// Actualizar una marca por su id
function updateBrand(request, response) {
  let brandId = request.params.brandId
  let newBrand = request.body
  newBrand.updatedBy = request.decoded.username
  newBrand.updatedAt = Date.now()
  findBrand(brandId)
    .then(brand => {
      return modifyBrand(brand, newBrand)
      // Si la marca con el id proporcionado existe se actualiza con los datos proporcionados
    })
    .then((result) => {
      return findBrand(brandId)
    })
    .then(brand => {
      return message.success(response, 200, 'Marca actualizada con éxito', brand)
    })
    .catch(error => {
      if (error.code && error.code === 11000) {
        let error = { code: 422, message: 'La marca ya existe', data: null }
        message.failure(response, error.code, error.message, error.data)
      } else if (error.code) {
        message.failure(response, error.code, error.message, error.data)
      } else {
        message.error(response, 500, error.message, error)
      }
    })
}
// Eliminar una marca por su id
function deleteBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        return Brand.remove({ _id: brand.id })
      } else {
        let error = { code: 404, message: 'La Marca no es válida', data: null }
        return Promise.reject(error)
      }
    })
    .then(() => {
      message.success(response, 200, 'Marca eliminada con éxito', null)
    })
    .catch(error => {
      if (error.code) {
        message.failure(response, error.code, error.message, error.data)
      } else {
        message.error(response, 500, 'No se pudo eliminar la marca', error)
      }
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
      let brand = null
      let supplier = null
      if (values[0]) {
        brand = values[0]
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la marca', data: null })
      }
      if (values[1]) {
        supplier = values[1]
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró el proveedor', data: null })
      }
      let isIncluded = brand.suppliers
        .map(current => current.toString())
        .includes(supplier._id.toString())
      if (isIncluded) {
        return Promise.reject({ code: 422, message: 'El proveedor ya se encuentra asociado a la marca', data: null })
      } else {
        brand.updatedBy = request.decoded.username
        brand.updatedAt = Date.now()
        return Brand.update({ _id: brand._id }, { $push: { suppliers: supplier._id }, updatedAt: brand.updatedAt, updatedBy: brand.updatedBy })
      }
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
      brand.updatedAt = Date.now()
      brand.updatedBy = request.decoded.username
      return Promise.all(suppliersIds.map(id => {
        let supplierId = mongoose.Types.ObjectId(id)
        return Brand.update({ _id: brandId }, { $pull: { suppliers: supplierId }, updatedAt: brand.updatedAt, updatedBy: brand.updatedBy })
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