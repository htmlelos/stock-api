'use strict';
const mongoose = require('mongoose')
const Branch = require('../models/branch')
const Business = require('../models/business')
const message = require('../services/response/message')

function populateAll(businesses) {
    return Promise.all(businesses.map(business => {
        return Business.populate(business, { path: 'warehouses' })
    }))
}
// Obtener todas las empresas
function getAllBusinesses(request, response) {
    Business.find({})
        .then(businesses => { return populateAll(businesses) })
        .then(businesses => { message.success(response, 200, '', businesses) })
        .catch(error => {
            console.log('ERROR--', error);
            message.failure(response, 404, 'No se pudieron recuperar las empresas', error)
        })
}
// Obtener todas las empresas que cumplan con los criterios especificados
function retrieveAllBusinesses(request, response) {
    let limit = parseInt(request.body.limit)
    let fields = request.body.fields
    let filter = request.body.filter
    let sort = request.body.sort

    Business.find(filter)
        .select(fields)
        .limit(limit)
        .sort(sort)
        .then(businesses => {
            return populateAll(businesses)
        })
        .then(businesses => {
            message.success(response, 200, '', businesses)
        })
        .catch(error => {
            message.failure(response, 404, 'No se pudieron recuperar las empresas', error)
        })
}

function checkBusiness(request) {
    request.checkBody('name', 'Debe proporcionar el nombre de la empresa')
        .notEmpty()
    request.checkBody('tributaryCode', 'El CUIT no es válido')
        .notEmpty()
        .isLength({ min: 11, max: 11 })
        .isCUIT()
    request.checkBody('status', 'El estado de la empresa es inválido')
        .isIn(['ACTIVO', 'INACTIVO'])
}

function createBusiness(request, response) {
    checkBusiness(request)

    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
                return Promise.reject({ code: 422, message: messages, data: null })
            }
            return Promise.resolve()
        })
        .then(result => {
            let newBusiness = new Business(request.body)
            newBusiness.createdBy = request.decoded.username
            return newBusiness.save()
        })
        .then(business => {
            message.success(response, 200, `Empresa creada con éxito`, { id: business._id })
        })
        .catch(error => {
            if (error.code && error.code === 11000) {
                let error = { code: 422, message: 'La empresa ya existe', data: null }
                message.failure(response, error.code, error.message, error.data)
            } else if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, 'No se pudo crear la empresa', null)
            }
        })
}

function findBusiness(businessId) {
    return Business.findById({ _id: businessId })
}

function getBusiness(request, response) {
    let businessId = request.params.businessId;
    // console.log('GET_BUSINESS--', businessId);
    findBusiness(businessId)
        .then(business => {
            if (business) {
                return Promise.resolve(business)
            } else {
                let error = { code: 404, message: 'No se encontró la empresa', data: null }
                return Promise.reject(error)
            }
        })
        .then(business => {
            message.success(response, 200, 'Empresa obtenida con éxito', business)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function updateBusiness(request, response) {
    let businessId = request.params.businessId
    findBusiness(businessId)
        .then(business => {
            if (business) {
                let newBusiness = request.body
                newBusiness.username = request.decoded.username
                newBusiness.updatedAt = Date.now()
                return Business.update({ _id: business._id }, { $set: newBusiness }, { runValidators: true })
            } else {
                let error = { code: 404, message: 'No se encontró la empresa', data: null }
                return Promise.reject(error)
            }
        })
        .then(() => {
            return findBusiness(businessId)
        })
        .then(business => {
            message.success(response, 200, 'Empresa actualizada con éxito', business)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function deleteBusiness(request, response) {
    let businessId = request.params.businessId
    findBusiness(businessId)
        .then(business => {
            if (business) {
                return Business.remove({ _id: business._id })
            } else {
                let error = { code: 404, message: 'No se encontró la empresa', data: null }
                return Promise.reject(error)
            }
        })
        .then(() => {
            message.success(response, 200, 'Empresa eliminada con éxito', null)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function findBranch(branchId) {
    return Branch.findById(branchId)
}

function addBranch(request, response) {
    let businessId = request.params.businessId
    let branchId = request.body.branchId
    let promiseBusiness = findBusiness(businessId)
    let promiseBranch = findBranch(branchId)
    Promise.all([promiseBusiness, promiseBranch])
        .then(values => {
            let business = values[0]
            let branch = values[1]
            if (!business) {
                return Promise.reject({ code: 404, message: 'no se encontró la empresa', data: null })
            }
            if (!branch) {
                return Promise.reject({ code: 404, message: 'no se encontró la sucursal', data: null })
            }
            let isIncluded = business.branchs
                .map(current => current.toString())
                .includes(branch._id.toString())
            if (isIncluded) {
                return Promise.reject({ code: 422, message: 'La sucursal ya se encuentra asociada a la empresa', data: null })
            } else {
                business.updatedBy = request.decoded.username
                business.updatedAt = Date.now()
                return Business.update({ _id: business._id }, { $push: { branchs: branch._id }, updatedAt: business.updatedAt, updatedBy: business.updatedBy })
            }
        })
        .then(() => {
            return findBusiness(businessId)
        })
        .then(business => {
            return Business.populate(business, { path: 'branchs' })
        })
        .then(business => {
            message.success(response, 200, 'Sucursal agregada con éxito', business.branchs)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function deleteBranch(request, response) {
    let businessId = request.params.businessId
    let branchId = request.body.branchId
    let businessPromise = findBusiness(businessId)
    let branchPromise = findBranch(branchId)
    Promise.all([businessPromise, branchPromise])
        .then(values => {
            let business = values[0]
            let branch = values[1]
            if (!business) {
                return Promise.reject({ code: 404, message: 'No se encontró la empresa', data: null })
            }
            if (!branch) {
                return Promise.reject({ code: 404, message: 'No se encontró la sucursal', data: null })
            }
            return Business.update({ _id: business._id }, { $pull: { branchs: { _id: branch._id } } })
        })
        .then(() => {
            return findBusiness(businessId)
        })
        .then(business => {
            message.success(response, 200, 'Sucursal eliminada con éxito', business.branchs)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function removeBranchs(request, response) {
    let businessId = request.params.businessId
    let selecteds = JSON.parse(request.body.branchs)
    findBusiness(businessId)
        .then(business => {
            if (business) {
                return Promise.all(selecteds.map(id => {
                    let branchId = mongoose.Types.ObjectId(id)
                    return Business.update({ _id: businessId }, { $pull: { 'branchs': id  } })
                }))
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró la empresa', data: null })
            }
        })
        .then((result) => {
            return findBusiness(businessId)
        })
        .then(business => {
            message.success(response, 200, 'Sucursales eliminadas con éxito', business.branchs)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

module.exports = {
    getAllBusinesses,
    retrieveAllBusinesses,
    createBusiness,
    getBusiness,
    updateBusiness,
    deleteBusiness,
    addBranch,
    deleteBranch,
    removeBranchs
}