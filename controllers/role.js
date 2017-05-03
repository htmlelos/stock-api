'use strict';
const Role = require('../models/role')
const message = require('../services/response/message')

// Obtener todos los roles
function getAllRoles(request, response) {
	Role.find({})
		.then(roles => {
			message.success(response, 200, '', roles)
		})
		.catch(error => {
			message.error(response, 422, '', error)
		})
}
// Obtiene los roles que cumplan con los criterios especificados
function retrieveAllRoles(request, response) {
	let limit = parseInt(request.body.limit)
	let fields = request.body.fields;
	let filter = request.body.filter;
	let sort = request.body.sort;

	Role.find(filter)
		.select(fields)
		.limit(limit)
		.sort(sort)
		.then(roles => {
			message.success(response, 200, '', roles)
		})
		.catch(error => {
			message.failure(response, 404, 'No se recuperaron los roles', error)
		})
}
// Valida que el nombre del rol esté presente
function checkName(request) {
	request.checkBody('name', 'Debe proporcionar un nombre de Rol')
		.notEmpty()
}
// Valida que este definida la descripción del rol
function checkDescription(request) {
	request.checkBody('description', 'Debe proporcionar una descripción del Rol')
		.notEmpty()	
}
// Valida los datos del estado del rol
function checkStatus(request) {
	request.checkBody('status', 'Debe definir el estado del Rol')
		.notEmpty()
	request.checkBody('status', 'El estado del Rol solo puede ser ACTIVO o INACTIVO')
		.isIn('ACTIVO', 'INACTIVO')
}
// Crea un nuevo Rol
function createRole(request, response) {
	checkName(request)
	checkDescription(request)
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
			// Crea una nueva instancia de Role con los parametros recibidos
			let newRole = new Role(request.body)
			newRole.createdBy = request.decoded.username
			return newRole.save()
		})
		.then(role => {
			message.success(response, 200, 'Rol creado con éxito', { id: role._id })
		})
		.catch(error => {
			if (error.code && error.code === 11000) {
				let error = { code: 422, message: 'El Rol ya existe', data: null }
				message.failure(response, error.code, error.message, error.data)
			} else if (error.code) {
				message.failure(response, error.code, error.message, error.data)
			} else {
				message.error(response, 500, error.message, error)
			}
		})
}
// Obtener un rol
function findRole(roleId) {
	return Role.findById({ _id: roleId })
}
// Obtener un rol por su roleId
function getRole(request, response) {
	findRole(request.params.roleId)
		.then(role => {
			if (role) {
				message.success(response, 200, 'Rol obtenido con éxito', role)
			} else {
				message.failure(response, 404, 'No se encontró el rol', null)
			}
		})
		.catch(error => {
			message.error(reponse, 500, 'El sistema tuvo un fallo al recuperar el rol, contactar al administrador del sistema', error)
		})
}
// Actualizar un rol por su roleId
function updateRole(request, response) {
	findRole(request.params.roleId)
		.then(role => {
			if (role) {
				let newRole = request.body
				newRole.updatedBy = request.decoded.username
				newRole.updatedAt = Date()
				Role.update({ _id: request.params.roleId }, { $set: newRole }, { runValidators: true })
					.then(role => {
						message.success(response, 200, 'Rol actualizado con éxito', null)
					})
					.catch(error => {
						if (error.code === 11000) {
							message.duplicate(response, 422, 'El rol ya existe', null)
						} else {
							message.error(response, 500, 'No se pudo actualizar el rol', error)
						}
					})
			} else {
				message.failure(response, 404, 'El rol no es válido', null)
			}
		})
		.catch(error => {
			message.error(response, 500, 'No se pudo recuperar el rol ', error)
		})
}

function deleteRole(request, response) {
	findRole(request.params.roleId)
		.then(role => {
			if (role) {
				Role.remove({ _id: role.id })
					.then(role => {
						message.success(response, 200, 'Rol eliminado con éxito', null)
					})
					.catch(error => {
						message.error(response, 422, '', error)
					})
			} else {
				message.failure(response, 404, 'El rol no es válido', null)
			}
		})
		.catch(error => {
			message.error(response, 422, 'No se pudo recuperar el rol', error)
		})
}

module.exports = {
	getAllRoles,
	retrieveAllRoles,
	createRole,
	getRole,
	updateRole,
	deleteRole
}
