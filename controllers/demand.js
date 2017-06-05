'use strict';
const Demand = require('../models/demand')
const message = require('../services/response/message')

function getAllDemands(request, response) {
    Demand.find({})
        .then(demands => {message.success(response, 200, '', demands)})
        .catch(error => {message.failure(response, 422, '', null)})
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
    request.checkBody('quantity','Debe ingresar la cantidad solicitada')
        .notEmpty()
    request.checkBody('product', 'Debe ingresar el producto solicitado')
        .notEmpty()
    request.checkBody('branch','Debe ingresar la sucursal que solicito el producto')
        .notEmpty()
    request.checkBody('supplier', 'Debe seleccionar el proveedor del producto')
}

function checkDemand(request) {
    request.checkBody('name', 'Debe proporcionar un nombre de solicitud de compra')
        .notEmpty()
    request.checkBody('startDate', 'Debe proporcionar un fecha inicial del pedido')
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
            message.success(response, 200, 'Solicitud creada con éxito', {id:demand._id})
        })
        .catch(error => {
            if (error.code && error.code === 11000) {
                let error = {code: 422, message: 'La solicitud de pedido ya existe'}
                message.failure(response, error.code, error.message, error.data)
            } else if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                messge.failure(response, 500, error.message, null)
            }
        })
}

module.exports = {
    getAllDemands,
    retrieveAllDemands,
    createDemand
}