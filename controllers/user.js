'use strict';
const mongoose = require('mongoose')
const Role = require('../models/role')
const User = require('../models/user')
const message = require('../services/response/message')
//Obtiene todos los usuarios
function getAllUsers(request, response) {
	let fields = '-password'
	User.find({})
		.select(fields)
		.then(users => {
			return Promise.all(users.map(user => {
				return Role.populate(user, { path: 'roles' })
			}))
		})
		.then(users => {
			message.success(response, 200, '', users)
		})
		.catch(error => {
			message.failure(response, 404, 'No se pudieron recuperar los usuarios', error)
		})
}
// obtener todos los usuarios que cumplan con los criterios especificados
function retrieveAllUsers(request, response) {
	let limit = parseInt(request.body.limit)
	let fields = request.body.fields
	let filter = request.body.filter
	let sort = request.body.sort

	User.find(filter)
		.select(fields)
		.limit(limit)
		.sort(sort)
		.then(users => {
			return Promise.all(users.map(user => {
				return Role.populate(user, { path: 'roles' })
			}))
		})
		.then(users => {
			message.success(response, 200, '', users)
		})
		.catch(error => {
			message.failure(response, 404, 'No se pudieron recuperar los usuarios', error)
		})
}
// Verifica los datos del usuario
function checkName(request) {
	request.checkBody('username', 'Debe proporcionar un nombre de usuario')
		.notEmpty()
}
function checkPassword(request) {
	request.checkBody('password', 'Debe proporcionar una contraseña')
		.notEmpty()
}
function checkStatus(request) {
	request.checkBody('status', 'Debe definir el estado del usuario')
		.notEmpty()
	request.checkBody('status', 'El estado de usuario solo puede ser ACTIVO o INACTIVO')
		.isIn('ACTIVO', 'INACTIVO')
}

//Crea un nuevo usuario
function createUser(request, response) {
	checkName(request)
	checkPassword(request)
	checkStatus(request)

	request.getValidationResult()
		.then(result => {
			if (!result.isEmpty()) {
				let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
				return Promise.reject({ code: 422, message: messages, data: null })
			}
			return Promise.resolve()
		})
		.then(result => {
			//Crea una nueva instacia de usuario con los parametros recibidos
			let newUser = new User(request.body)
			newUser.createdBy = request.decoded.username
			return newUser.save()
		})
		.then(user => {
			message.success(response, 200, 'Usuario creado con éxito', { id: user._id })
		})
		.catch(error => {
			if (error.code === 11000) {
				let error = { code: 422, message: 'El usuario ya existe', data: null }
				message.duplicate(response, error.code, error.message, error.data)
			} else {
				message.failure(response, error.code, error.message, error.data)
			}
		})
}
// Obtener un usuario
function findUser(userId) {
	return User.findById({ _id: userId })
}
// Obtener un usuario por su id
function getUser(request, response) {
	findUser(request.params.userId)
		.select('-password')
		.then(user => {
			if (user) {
				message.success(response, 200, 'Usuario obtenido con éxito', user)
			} else {
				message.failure(response, 404, 'No se encontró el usuario', null)
			}
		})
		.catch(error => {
			message.error(response, 422, 'No se pudo recuperar el usuario', error)
		})
}

// Actualiza un usuario por su id
function updateUser(request, response) {
	// Encuentra el usuario a actualizar
	findUser(request.params.userId)
		.then(user => {
			// Si el usuario existe se actualiza con los datos proporcionados
			if (user) {
				let newUser = request.body
				newUser.updatedBy = request.decoded.username
				newUser.updatedAt = Date.now()

				return User.update({ _id: request.params.userId }, { $set: newUser })
			} else {
				let error = { code: 404, message: 'El usuario, no es un usuario válido', data: null }
				return Promise.reject(error)
			}
		})
		.then(user => {
			message.success(response, 200, 'Usuario actualizado con éxito', null)
		})
		.catch(error => {
			if (error.code === 11000) {
				message.failure(response, 422, 'El usuario ya existe', null)
			} else {
				message.failure(response, error.code, error.message, error.data)
			}
		})
}
// Elimina un usuario por su id
function deleteUser(request, response) {
	findUser(request.params.userId)
		.select('-password')
		.then(user => {
			if (user) {
				User.remove({ _id: user.id })
					.then(user => {
						message.success(response, 200, 'Usuario eliminado con éxito', null)
					})
					.catch(error => {
						message.error(response, { status: 422, message: '', data: error })
						message.error(response, 500, 'No se pudo eliminar el usuario', error)
					})
			} else {
				message.failure(response, 404, 'El usuario, no es un usuario válido', null)
			}
		})
		.catch(error => {
			message.error(response, 500, 'No se pudo eliminar el usuario', error)
		})
}
// Encontrar un rol
function findRole(roleId) {
	return Role.findById({ _id: roleId })
}

function checkUserId(request) {
	// Verificar el usuario id
	request.checkBody('roleId', 'El rol no es válido')
		.notEmpty()
}
// 
function checkRoleId(request) {
	// Verificar el id del rol
	request.checkParams('userId', 'El usuario no es válido')
		.notEmpty()
}
// Agregar un rol a un usuario
function addUserRole(request, response) {

	checkUserId(request)
	checkRoleId(request)

	request.getValidationResult()
		.then(result => {
			if (!result.isEmpty()) {
				let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
				return Promise.reject({ code: 422, message: messages, data: null })
			}
			return Promise.resolve()
		})
		.then(result => {
			let promiseUser = findUser(request.params.userId)
			let promiseRole = findRole(request.body.roleId)
			return Promise.all([promiseUser, promiseRole])
		})
		.then(values => {
			let user = null;
			let role = null;
			if (values[0]) {
				user = values[0]
			} else {
				return Promise.reject({ code: 404, message: 'No se encontró el Usuario', data: null })
			}
			if (values[1]) {
				role = values[1]
			} else {
				return Promise.reject({ code: 404, message: 'No se encontró el Rol', data: null })
			}
			let isIncluded = user.roles
				.map(current => current.toString())
				.includes(role._id.toString())
			if (isIncluded) {
				return Promise.reject({ code: 422, message: 'El rol ya se encuentra asociado al usuario', data: null })
			} else {
				return User.update({ _id: user._id }, { $push: { roles: role } })
			}
		})
		.then(() => {
			return findUser(request.params.userId)
		})
		.then(user => {
			return User.populate(user, {path: 'roles'})
		})
		.then(user => {
			console.log('ROLES--', user.roles);
			message.success(response, 200, 'El rol se añadio con éxito', user.roles)
		})
		.catch(error => {
			message.failure(response, error.code, error.message, error.data)
		})
}
// Obtener los roles de un usuario
function getUserRoles(request, response) {

	findUser(request.params.userId)
		.select('-password')
		.then(user => {
			if (user) {
				return Role.populate(user, { path: 'roles' })
			} else {
				let error = { code: 404, message: 'El usuario no es un usuario válido', data: null }

				return Promise.reject(error)
			}
		})
		.then(user => {
			return User.populate(user, {path: 'roles'})
		})
		.then(user => {
			message.success(response, 200, '', user.roles)
		})
		.catch(error => {
			message.failure(response, error.code, error.message, error.data)
		})
}
// Eliminar un rol de un usuario
function deleteUserRole(request, response) {
	findUser(request.params.userId)
		.select('-password')
		.then(user => {
			if (user) {
				findRole(request.params.roleId)
					.then(role => {
						if (role) {
							let index = user.roles
								.findIndex(element => element.toString() == role._id.toString())
							if (index >= 0) {
								user.roles.splice(index, 1)
								//user.save()
								User.update({ _id: user._id }, { $set: { roles: user.roles } })
									.then(result => {
										message.success(response, 200, 'Rol revocado con éxito', null)
									})
									.catch(error => {
										message.error(response, 500, 'No se pudo eliminar el rol de usuario', error)
									})
							} else {
								message.failure(response, 404, 'El rol, no es un rol válido', null)
							}
						} else {
							message.failure(response, 404, 'El rol, no es un rol válido', null)
						}
					})
					.catch(error => {
						message.error(response, 500, 'No se pudo encontrar el rol', error)
					})
			} else {
				message.failure(response, 404, 'El usuario, no es un usuario válido', null)
			}
		})
		.catch(error => {
			message.error(response, 500, 'No se pudo eliminar el rol del usuario', error)
		})
}

function createDefaultUser(request, response, next) {
	User.findOne({ username: settings.superuser })
		.then(user => {
			if (!user) {
				let superUser = new User({
					username: settings.superuser,
					password: 'super',
					status: 'ACTIVO'
				})

				superUser.save()
					.then(user => {
						next()
					})
					.catch(error => {
						message.error(response, 500, 'No se pudo crear el superusuario', null)
					})
			}
			next()
		})
		.catch(error => {
			message.error(response, 500, 'No se pudo crear el super usuario', null)
		})
}

function removeUserRoles(request, response) {
	findUser(request.params.userId)
		.then(user => {
			let rolesIds = JSON.parse(request.body.roles)
			let userId = request.params.userId
			return Promise.all(rolesIds.map(id => {
				let roleId = mongoose.Types.ObjectId(id)
				return User.update({_id: userId}, {$pull:{roles: roleId}})
			}))
		})
		.then(() => {
			return findUser(request.params.userId)
		})
		.then(user => {
			return User.populate(user, {path: 'roles'})
		})
		.then(user => {
			console.log('ROLES--', user.roles);
			message.success(response, 200, 'Roles eliminados con éxito', user.roles)
		})
		.catch(error => {
			message.failure(response, error.code, error.message, error.data)
		})
}

module.exports = {
	getAllUsers,
	retrieveAllUsers,
	createUser,
	getUser,
	updateUser,
	deleteUser,
	addUserRole,
	getUserRoles,
	deleteUserRole,
	removeUserRoles
}
