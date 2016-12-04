'use strict';
const Supplier = require('../models/supplier')
const Brand = require('../models/brand')
const message = require('../services/response/message')

// Obtiene todas las marcas
function getAllBrands(request, response) {
  Brand.find({})
    .then(brands => {

        Supplier.populate(brands, {path: 'suppliers'})
          .then(user => {
            message.success(response, {status: 200, message: '', data: brands})
          })
          .catch(error => {
            message.error(response, { status: 422, message: '', data: error})
          })

    })
    .catch(error => {
      message.failure(response, {status: 404, message: '', data: error})
    })
}

// Crear una nueva marca
function createBrand(request, response) {
  //Crea una nueva instancia de marca con los parametros recibidos
  let newBrand = new Brand(request.body)

  newBrand.save()
    .then(brand => {
      message.success(response, {status: 200, message: 'Marca creada con exito', data: null})
    })
    .catch(error => {
      if (error.code === 11000) {
        message.duplicate(response, {status: 422, message: 'La marca ya existe', data: null})
      } else {
        message.error(response, { status: 422, message: '', data: error})
      }
    })
}
// Obtener una marca
function findBrand(brandId) {
  return Brand.findById({_id: brandId})
}
// Obtener un usuario por su id
function getBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        Supplier.populate(brand, {path: 'suppliers'})
          .then(user => {
            message.success(response, {status: 200, message: 'Marca obtenida con exito', data: brand})
          })
          .catch(error => {
            message.error(response, { status: 422, message: '', data: error})
          })        
      } else {
        message.failure(response, {status: 404, message: 'No se encontró la marca', data: null})
      }
    })
    .catch(error => {
      message.error(response, {status: 422, message: '', data: error})
    })
}

function assignBrand(oldValue, newValue) {
  return Object.assign(oldValue, newValue).save()
}

function updateBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        assignBrand(brand, request.body)
          .then(brand => {
            message.success(response, {status: 200, message: 'Marca actualizada con exito', data: brand})
          })
          .catch(error => {
            if (error.code === 11000) {
              message.duplicate(response, {status: 422, message: 'La marca ya existe', data: null})
            } else {
              message.error(response, {status: 422, message: '', data: error })
            }
          })
      } else {
        message.failure(response, { status: 404, message: 'La marca, no es una marca valida', data: null})
      }
    })
    .catch(error => {
      message.error(response, {status: 422, message: '', data: error})
    })
}

function deleteBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        Brand.remove({ _id: brand.id })
          .then(brand => {
            message.success(response, { status: 200, message: 'Marca eliminada con exito', data: null })
          })
          .catch(error => {
            message.error(response, { status: 422, message: '', data: error })
          })
      } else {
        message.failure(response, { status: 404, message: 'La marca, no es una marca valida', data: null })
      }
    })
    .catch(error => {
      message.error(response, { status: 422, message: '', data: error })
    })
}

module.exports = {
  getAllBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand
}
