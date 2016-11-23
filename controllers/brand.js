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
      console.log('--SUCCESS--'. brand);
      message.success(response, {status: 200, message: 'Marca creada con exito', data: null})
    })
    .catch(error => {
      console.log('--ERROR--'. error);
      if (error.code === 11000) {
        message.duplicate(response, {status: 422, message: 'La marca ya existe', data: null})
      } else {
        message.error(response, { status: 422, message: '', data: error})
      }
    })
}

module.exports = {
  getAllBrands,
  createBrand
}
