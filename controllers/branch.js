'use strict';
const Branch = require('../models/branch')
const Business = require('../models/business')
const message = require('../services/response/message')

//Obtener todas las sucursales
function getAllBranchs(request, response) {
    Branch.find({})
        .then(branchs => message.success(response, 200, '', branchs))
        .catch(error => message.failure(response, 422, '', null))
}

function retrieveAllBranchs(request, response) {
    let limit = parseInt(request.body.limit)
    let fields = request.body.fields;
    let filter = request.body.filter;
    let sort = request.body.sort;

    Branch.find(filter)
        .select(fields)
        .limit(limit)
        .sort(sort)
        .then(roles => { message.success(response, 200, '', roles) })
        .catch(error => { message.failure(response, 404, 'No se recuperó la sucursal', null) })
}

function checkBranch(request) {
    request.checkBody('name', 'Debe proporcionar el nombre de la sucursal')
        .notEmpty()
    request.checkBody('status', 'Debe definir el estado de la sucursal')
        .notEmpty()
    request.checkBody('status', 'El estado de la sucursal solo puede ser ACTIVO o INACTIVO')
        .isIn('ACTIVO', 'INACTIVO')
    request.checkBody('business', 'Debe indicar la empresa a la que pertenece la sucursal')
        .notEmpty()
}
// Crea una nueva sucursal
function createBranch(request, response) {
    checkBranch(request)

    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly()
                    .array()
                    .map(x => x.msg)
                    .join(',')
                return Promise.reject({ code: 422, message: messages, data: null })
            }
            return Promise.resolve()
        })
        .then(() => {
            let businessId = request.body.business
            if (businessId) {
                return findBusiness(request.body.business)
            } else {
                let error = { code: 404, message: 'La empresa indicada no es válida' }
                return Promise.reject(error)
            }
        })
        .then(business => {
            if (!business) {
                let error = { code: 404, message: 'No se encontró la empresa', data: null }
                return Promise.reject(error)
            }
        })
        .then(() => {
            // Crea una nueva instancia de Branch con los parametros recibidos en el body
            let branch = new Branch(request.body)
            branch.createdBy = request.decoded.username
            return branch.save()
        })
        .then(branch => {
            message.success(response, 200, 'Sucursal creada con éxito', { id: branch._id })
        })
        .catch(error => {
            if (error.code && error.code === 11000) {
                let error = { code: 422, message: 'La sucursal ya existe', data: null }
                message.failure(response, error.code, error.message, error.data)
            } else if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, error.message, error)
            }
        })
}
// Obtener una sucursal
function findBranch(branchId) {
    return Branch.findById({ _id: branchId })
}
// Obtener una sucursal por su branchId
function getBranch(request, response) {
    let branchId = request.params.branchId
    findBranch(branchId)
        .then(branch => {
            if (branch) {
                return Promise.resolve(branch)
            } else {
                let error = { code: 404, message: 'No se encontro la sucursal', data: null }
                return Promise.reject(error)
            }
        })
        .then(branch => {
            message.success(response, 200, 'Sucursal obtenida con éxito', branch);
        })
        .catch(error => {
            if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(500, error.message, null)
            }
        })
}
// Actualiza la sucursal
function modifyBranch(branch, newBranch) {
    if (branch) {
        return Branch.update({ _id: branch._id }, { $set: newBranch }, { runValidators: true })
    } else {
        let error = { code: 404, message: 'No se encontró la sucursal', data: null }
        return Promise.reject(error)
    }
}
// Actualiza la sucursal por su id
function updateBranch(request, response) {
    let branchId = request.params.branchId
    let newBranch = request.body
    newBranch.updatedBy = request.decoded.username
    newBranch.updatedAt = Date.now()
    findBranch(branchId)
        .then(branch => {
            return modifyBranch(branch, newBranch)
        })
        .then(() => {
            return findBranch(branchId)
        })
        .then(branch => {
            message.success(response, 200, 'Sucursal actualizada con éxito', { id: branch.id })
        })
        .catch(error => {
            if (error.code && error.code === 11000) {
                let error = { code: 422, message: 'La Sucursal ya existe', data: null }
                message.failure(response, error.code, error.message, error.data)
            } else if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, 'No se pudo recuperar la sucursal', null)
            }
        })
}

function removeBranch(branch) {
    if (branch) {
        return Branch.remove({ _id: branch._id })
    } else {
        let error = { code: 404, message: 'La Sucursal no es válida', data: null }
        return Promise.reject(error)
    }
}
// Eliminar una sucursal por su branchId
function deleteBranch(request, response) {
    let branchId = request.params.branchId
    findBranch(branchId)
        .then(branch => { return removeBranch(branch) })
        .then(() => { message.success(response, 200, 'Sucursal eliminada con éxito', null) })
        .catch(error => {
            if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, error.message, null)
            }
        })
}

function findBusiness(branchId) {
    return Business.findById(branchId)
}

module.exports = {
    getAllBranchs,
    retrieveAllBranchs,
    createBranch,
    getBranch,
    updateBranch,
    deleteBranch
}