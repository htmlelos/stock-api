'use strict';
const Supplier = require('../models/supplier')
const Brand = require('../models/brand')
const message = require('../services/response/message')

// Obtiene todas las marcas
function getAllBrands(request, response) {
  Brand.find({})
    .then(brands => {
      message.success(response, {status: 200, message: '', data: brands})
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
  console.log('--BRAND-ID--', request.params.brandId);
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        message.success(response, {status: 200, message: 'Marca obtenida con exito', data: brand})
      } else {
        message.failure(response, {status: 404, message: 'No se encontró la marca', data: null})
      }
    })
    .catch(error => {
      message.error(response, {status: 422, message: '', data: error})
    })
}

module.exports = {
  getAllBrands,
  createBrand,
  getBrand
}
