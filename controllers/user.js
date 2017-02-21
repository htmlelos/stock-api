'use strict';
const Role = require('../models/role')
const User = require('../models/user')
const message = require('../services/response/message')
//Obtiene todos los usuarios
function getAllUsers(request, response) {

	User.find({})
		.select('-password')
		.then(users => {
			message.success(response, 200, '', users)
		})
		.catch(error => {
			message.failure(response, 404, 'No se pudieron recuperar los usuarios', error)
		})
}
//Crea un nuevo usuario
function createUser(request, response) {
	//Crea una nueva instacia de usuario con los parametros recibidos
	let newUser = new User(request.body)
	newUser.createdBy = request.decoded.username
	newUser.save()
		.then(user => {
			message.success(response, 200, 'Usuario creado con exito', { id: user._id })
		})
		.catch(error => {
			if (error.code === 11000) {
				message.duplicate(response, 422, 'El usuario ya existe', null)
			} else {
				message.error(response, 422, 'No se pudo crear el usuario', error)
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
				message.success(response, 200, 'Usuario obtenido con exito', user)
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
				User.update({ _id: request.params.userId }, { $set: newUser })
					.then(result => {
						message.success(response, 200, 'Usuario actualizado con exito', null)
					})
					.catch(error => {
						if (error.code === 11000) {
							message.duplicate(response, 422, 'El usuario ya existe', null)
						} else {
							message.error(response, 422, 'No se pudo actualizar el usuario', error)
						}
					})
			} else {
				message.failure(response, 404, 'El usuario, no es un usuario valido', null)
			}
		})
		.catch(error => {
			message.error(response, 422, 'No se pudo actualizar el usuario', error)
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
						message.success(response, 200, 'Usuario eliminado con exito', null)
					})
					.catch(error => {
						message.error(response, { status: 422, message: '', data: error })
						message.error(response, 500, 'No se pudo eliminar el usuario', error)
					})
			} else {
				message.failure(response, 404, 'El usuario, no es un usuario valido', null)
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
// Agregar un rol a un usuario
function addUserRole(request, response) {
	findUser(request.params.userId)
		.select('-password')
		.then(user => {
			if (user) {
				let roleId = request.body.roleId
				if (roleId) {
					findRole(roleId)
						.then(role => {
							if (role) {
								let isIncluded = user.roles
									.map(current => current.toString())
									.includes(role._id.toString())

								if (isIncluded) {
									message.failure(response, 422, 'El rol ya se encuentra asociado al usuario', null)
								} else {
									User.update({ _id: user._id }, { $addToSet: { roles: role } })
										.then(result => {
											message.success(response, 200, 'El rol se añadio con exito', { id: user._id })
										})
										.catch(error => {
											message.error(response, 500, 'No se pudo añadir el rol al usuario', error)
										})
								}

							} else {
								message.failure(response, 404, 'El rol no es valido', null)
							}
						})
						.catch(error => {
							message.error(response, { status: 422, message: '', data: error })
						})
				} else {
					message.failure(response, 422, 'El rol no es valido', null)
				}
			} else {
				message.failure(response, 404, 'El usuario no es valido', null)
			}
		})
		.catch(error => {
			message.error(response, 500, 'No se pudo añadir el rol al usuario', error)
		})
}
// Obtener los roles de un usuario
function getUserRoles(request, response) {

	findUser(request.params.userId)
		.select('-password')
		.then(user => {
			Role.populate(user, { path: 'roles' })
				.then(user => {
					if (user) {
						message.success(response, 200, '', user.roles)
					} else {
						message.failure(response, 404, 'El usuario no es un usuario valido', null)
					}
				})
				.catch(error => {
					message.error(response, 422, 'No se pudo recuperar los roles1', error)
				})
		})
		.catch(error => {
			message.error(response, 500, 'No se pudo recuperar los roles del usuario', error)
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
										message.success(response, 200, 'Rol revocado con exito', null)
									})
									.catch(error => {
										message.error(response, 500, 'No se pudo eliminar el rol de usuario', error)
									})
							} else {
								message.failure(response, 404, 'El rol, no es un rol valido', null)
							}
						} else {
							message.failure(response, 404, 'El rol, no es un rol valido', null)
						}
					})
					.catch(error => {
						message.error(response, 500, 'No se pudo encontrar el rol', error)
					})
			} else {
				message.failure(response, 404, 'El usuario, no es un usuario valido', null)
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

module.exports = {
	getAllUsers,
	createUser,
	getUser,
	updateUser,
	deleteUser,
	addUserRole,
	getUserRoles,
	deleteUserRole
}
