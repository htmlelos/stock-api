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
      console.log('--ERROR-422--', error);
      message.error(response, {
        status: 422,
        message: '',
        data: error
      })
    })
}

module.exports = {
  getAllSupliers
}
