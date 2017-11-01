'use strict';
const mongoose = require('mongoose')
const Role = require('../models/role')
const User = require('../models/user')
const message = require('../services/response/message')

function populateAll(users) {
	return Promise.all(users.map(user => {
		return User.populate(user, { path: 'roles' })
	}))
}
//Obtiene todos los usuarios
function getAllUsers(request, response) {
	let fields = '-password'
	User.find({})
		.select(fields)
		.then(users => { return populateAll(users) })
		.then(users => { message.success(response, 200, '', users) })
		.catch(error => { message.failure(response, 404, 'No se pudieron recuperar los usuarios', error) })
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
		.then(users => { return populateAll(users) })
		.then(users => { message.success(response, 200, '', users) })
		.catch(error => { message.failure(response, 404, 'No se pudieron recuperar los usuarios', error) })
}
// Valida los datos del usuario
function checkUser(request) {
	request.checkBody('username', 'Debe proporcionar un nombre de usuario')
		.notEmpty()
	request.checkBody('password', 'Debe proporcionar una contraseña')
		.notEmpty()
	request.checkBody('status', 'Debe definir el estado del usuario')
		.notEmpty()
	request.checkBody('status', 'El estado de usuario solo puede ser ACTIVO o INACTIVO')
		.isIn(['ACTIVO', 'INACTIVO'])
	request.checkBody('business', 'Debe indicar la empresa a la que pertence el usuario')
		.notEmpty()
}

//Crea un nuevo usuario
function createUser(request, response) {
	checkUser(request)

	request.getValidationResult()
		.then(result => {
			if (!result.isEmpty()) {
				let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
				return Promise.reject({ code: 422, message: messages, data: null })
			}
			return Promise.resolve()
		})
		.then(() => {
			//Crea una nueva instacia de usuario con los parametros recibidos
			let newUser = new User(request.body)
			newUser.createdBy = request.decoded.username
			return newUser.save()
		})
		.then(user => {
			console.error('USUARIO--', usuario);
			message.success(response, 200, 'Usuario creado con éxito', { id: user._id })
		})
		.catch(error => {
			console.error('ERROR--', err);
			if (error.code && error.code === 11000) {
				let error = { code: 422, message: 'El usuario ya existe', data: null }
				message.failure(response, error.code, error.message, error.data)
			} else if (error.code) {
				message.failure(response, error.code, error.message, error.data)
			} else {
				message.failure(response, 500, error.message, null)
			}
		})
}
// Obtener un usuario
function findUser(userId) {
	return User.findById({ _id: userId })
}

function populateUser(user) {
	if (user) {
		return User.populate(user, { path: 'roles' })
	} else {
		let error = { code: 404, message: 'No se encontró el usuario', data: null }
		return Promise.reject(error)
	}
}
// Obtener un usuario por su id
function getUser(request, response) {
	findUser(request.params.userId)
		.select('-password')
		.then(user => { return populateUser(user) })
		.then(user => { message.success(response, 200, 'Usuario obtenido con éxito', user) })
		.catch(error => { message.failure(response, error.code, error.message, error.data) })
}
// Modificar el registro del usuario
function modifyUser(user, newUser) {
	if (user) {
		return User.update({ _id: user._id }, { $set: newUser }, { runValidators: true })
	} else {
		let error = { code: 404, message: 'El usuario no es válido', data: null }
		return Promise.reject(error)
	}
}
// Actualiza un usuario por su id
function updateUser(request, response) {

	let userId = request.params.userId
	let newUser = request.body
	newUser.updatedBy = request.decoded.username
	newUser.updatedAt = Date.now()
	findUser(userId)
		.then(user => { return modifyUser(user, newUser) })
		.then(() => { return findUser(userId).select('-password') })
		.then(user => { return User.populate(user, { path: 'roles' }) })
		.then(user => { message.success(response, 200, 'Usuario actualizado con éxito', user) })
		.catch(error => {
			if (error.code && error.code === 11000) {
				let error = { code: 422, message: 'El usuario ya existe', data: null }
				message.failure(response, error.code, error.message, error.data)
			} else if (error.code) {
				message.failure(response, error.code, error.message, error.data)
			} else {
				message.failure(response, 500, error.message, error)
			}
		})
}
// Remueve un usuario
function removeUser(user) {
	if (user) {
		return User.remove({ _id: user.id })
	} else {
		let error = { code: 404, message: 'El usuario no es válido', data: null }
		return Promise.reject(error)
	}
}
// Elimina un usuario por su id
function deleteUser(request, response) {
	let userId = request.params.userId
	findUser(userId).select('-password')
		.then(user => { return removeUser(user) })
		.then(() => { message.success(response, 200, 'Usuario eliminado con éxito', null) })
		.catch(error => {
			if (error.code) {
				message.failure(response, error.code, error.message, error.data)
			} else {
				message.failure(response, 500, error.message, error)
			}
		})
}
// Encontrar un rol
function findRole(roleId) {
	return Role.findById({ _id: roleId })
}
// Verificiar el id de usuario no este vacio
function checkUserId(request) {
	// Verificar el usuario id
	request.checkBody('roleId', 'El rol no es válido')
		.notEmpty()
}
// Verificar el id de Rol no este vacio
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
				user.updatedBy = request.decoded.username
				user.updatedAt = Date.now()
				return User.update({ _id: user._id }, { $push: { roles: role }, updatedAt: user.updatedAt, updatedBy: user.updatedBy })
			}
		})
		.then(() => {
			return findUser(request.params.userId)
		})
		.then(user => {
			return User.populate(user, { path: 'roles' })
		})
		.then(user => {
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
			return User.populate(user, { path: 'roles' })
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
	let userId = request.params.userId
	let roleId = request.params.roleId

	let promiseUser = findUser(userId).select('-password')
	let promiseRole = findRole(roleId)

	Promise.all([promiseUser, promiseRole])
		.then(values => {
			let user = null
			let role = null
			if (values[0]) {
				user = values[0]
			} else {
				return Promise.reject({ code: 404, message: 'No se encontró el usuario', data: null })
			}
			if (values[1]) {
				role = values[1]
			} else {
				return Promise.reject({ code: 404, message: 'No se encontró el rol', data: null })
			}
			user.updatedBy = request.decoded.username
			user.updatedAt = Date.now()
			return User.update({ _id: user._id }, { $pull: { roles: role._id }, updatedAt: user.updatedAt, updatedBy: user.updatedBy })
		})
		.then(() => {
			return findUser(userId)
		})
		.then(user => {
			message.success(response, 200, 'Rol revocado con éxito', user.roles)
		})
		.catch(error => {
			message.failure(response, error.code, error.message, error.data)
		})
}

function removeUserRoles(request, response) {
	findUser(request.params.userId)
		.then(user => {
			let rolesIds = JSON.parse(request.body.roles)
			let userId = request.params.userId
			return Promise.all(rolesIds.map(id => {
				let roleId = mongoose.Types.ObjectId(id)
				user.updatedBy = request.decoded.username
				user.updatedAt = Date.now()
				return User.update({ _id: userId }, { $pull: { roles: roleId }, updatedAt: user.updatedAt, updatedBy: user.updatedBy })
			}))
		})
		.then(() => {
			return findUser(request.params.userId)
		})
		.then(user => {
			return User.populate(user, { path: 'roles' })
		})
		.then(user => {
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
