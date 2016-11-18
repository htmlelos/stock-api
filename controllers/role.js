'use strict';
const Role = require('../models/role')
const message = require('../services/response/message')

// Obtener todos los roles
function getAllRoles(request, response) {
	Role.find({})
		.then(roles => {
			message.success(response, { status: 200, message: '', data: roles })
		})
		.catch(error => {
			message.error(response, { status: 422, message: '', data: error })
		})
}
//Crea un nuevo Rol
function createRole(request, response) {
	//Crea una nueva instancia de Role con los parametros recibidos
	let newRole = new Role(request.body)

	newRole.save()
		.then(role => {
			message.success(response, {status: 200, message: 'Rol creado con exito', data: null})
		})
		.catch(error => {
			if (error.code === 11000) {
					message.duplicate(response, { status: 422, message: 'El rol ya existe', data: null })
			} else {
					message.error(response, { status: 422, message: '', data: error })
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
				if(role) {
					message.success(response, { status: 200, message: 'Rol obtenido con exito', data: role })
				} else {
					message.failure(response, { status: 404, message: 'No se encontro el rol', data: role })
				}
			})
			.catch(error => {
				message.error(reponse, { status: 404, message: '', data: error })
			})
	}
	// Asigna el nuevo dato al rol
	function assignRole(oldValue, newValue) {
		return Object.assign(oldValue, newValue).save()
	}
	// Actualizar un rol por su roleId
	function updateRole(request, response) {
		findRole(request.params.roleId)
			.then(role => {
				if(role) {
					assignRole(role, request.body)
						.then(role => {
							message.success(response, { status: 200, message: 'Rol actualizado con exito', data: null })
						})
						.catch(error => {
							if(error.code === 11000) {
								message.duplicate(response, {status: 422, message: 'El rol ya existe', data: null})
							} else {
								message.error(response, { status: 404, message: '', data: error })
							}
						})
				} else {
					message.failure(response, { status: 404, message: 'El rol, no es un rol valido', data: null })
				}
			})
			.catch(error => {
				message.error(response, { status: 404, message: '', data: error })
			})
	}

	function deleteRole(request, response) {
		findRole(request.params.roleId)
			.then(role => {
				if(role) {
					Role.remove({ _id: role.id })
						.then(role => {
							message.success(response, {status: 200, message: 'Rol eliminado con exito', data: null})
						})
						.catch(error => {
							message.error(response, { status: 422, message: '', data: error })
						})
				} else {
					message.error(response, { status: 404, message: 'El rol, no es un rol valido', data: error })
				}
			})
			.catch(error => {
				message.error(response, { status: 422, message: '', data: error })
			})
	}

	module.exports = {
		getAllRoles,
		createRole,
		getRole,
		updateRole,
		deleteRole
	}
