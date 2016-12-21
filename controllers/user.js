'use strict';
const Role = require('../models/role')
const User = require('../models/user')
const message = require('../services/response/message')
//Obtiene todos los usuarios
function getAllUsers(request, response) {

	User.find({})
		.select('-password')
		.then(users => {
			message.success(response, { status: 200, message: '', data: users })
		})
		.catch(error => {
			message.failure(response, { status: 404, message: '', data: error })
		})
}
//Crea un nuevo usuario
function createUser(request, response) {
	//Crea una nueva instacia de usuario con los parametros recibidos
	let newUser = new User(request.body)
	newUser.createdBy = global.currentUser.username
	newUser.save()
		.then(user => {
			message.success(response, { status: 200, message: 'Usuario creado con exito', data: {id: user._id} })
		})
		.catch(error => {
			if (error.code === 11000) {
				message.duplicate(response, { status: 422, message: 'El usuario ya existe', data: null })
			} else {
				message.error(response, { status: 422, message: '', data: error })
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
				message.success(response, { status: 200, message: 'Usuario obtenido con exito', data: user })
			} else {
				message.failure(response, { status: 404, message: 'No se encontró el usuario', data: null })
			}
		})
		.catch(error => {
			message.error(response, { status: 422, message: '', data: error })
		})
}
// Asigna el nuevo dato a el usuario
function assignUser(oldValue, newValue) {
	// console.log('--OLDVALUE--', oldValue);
	// console.log('--NEWVALUE--', newValue);
	return Object.assign(oldValue, newValue).save()
}
// Actualiza un usuario por su id
function updateUser(request, response) {
	// Encuentra el usuario a actualizar
	findUser(request.params.userId)
		.select('-password')
		.then(user => {
			// Si el usuario existe se actualiza con los datos proporcionados
			if (user) {
				let newUser = request.body
				newUser.updatedBy = global.currentUser.username
				newUser.updatedAt = Date().now
				assignUser(user, newUser)
					.then(user => {
						console.log('--USER-UPDATED--', user);
						message.success(response, { status: 200, message: 'Usuario actualizado con exito', data: null })
					})
					.catch(error => {
						console.error('--ERROR-422-1--', error);
						if (error.code === 11000) {
							message.duplicate(response, { status: 422, message: 'El usuario ya existe', data: null })
						} else {
							message.error(response, { status: 422, message: '', data: error })
						}
					})
			} else {
				message.failure(response, { status: 404, message: 'El usuario, no es un usuario valido', data: null })
			}
		})
		.catch(error => {
			console.error('--ERROR-422-2--', error);
			message.error(response, { status: 422, message: '', data: error })
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
						message.success(response, { status: 200, message: 'Usuario eliminado con exito', data: null })
					})
					.catch(error => {
						message.error(response, { status: 422, message: '', data: error })
					})
			} else {
				message.failure(response, { status: 404, message: 'El usuario, no es un usuario valido', data: null })
			}
		})
		.catch(error => {
			message.error(response, { status: 422, message: '', data: error })
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
								let isIncluded = user.roles.map(current => current.toString()).includes(role._id.toString())								

								if (isIncluded) {
									message.failure(response, { status: 422, message: 'El rol ya se encuentra asociado al usuario', data: null })
								} else {
									user.roles.push(role)
									user.save()
										.then(user => {
											message.success(response, { status: 200, message: 'El rol se añadio con exito', data: {id: user._id} })
										})
										.catch(error => {
											message.error(response, { status: 422, message: '', data: error })
										})
								}

							} else {
								message.failure(response, { status: 404, message: 'El rol, no es un rol valido', data: null })
							}
						})
						.catch(error => {
							message.error(response, { status: 422, message: '', data: error })
						})
				} else {
					message.failure(response, { status: 422, message: 'El rol, no es un rol valido', data: null })
				}
			} else {
				message.failure(response, { status: 404, message: 'El usuario, no es un usuario valido', data: null })
			}
		})
		.catch(error => {
			message.error(response, { status: 422, message: '', data: error })
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
				message.success(response, { status: 200, message: '', data: user.roles })
			} else {
				message.error(response, { status: 404, message: 'El usuario no es un usuario valido', data: '' })
			}
			})
			.catch(error => { 
				message.error(response, { status: 422, message: '', data: error }) 
			})
		})
		.catch(error => { 
			message.error(response, { status: 422, message: '', data: error }) 
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
							let index = user.roles.findIndex((element) => element = role._id)
							if (index >= 0) {
								user.roles.splice(index, 1)
								user.save()
								message.success(response, { status: 200, message: 'Rol revocado con exito', data: null })
							} else {
								message.failure(response, { status: 404, message: 'El rol, no es un rol valido', data: null })
							}
						} else {
							message.failure(response, { status: 404, message: 'El rol, no es un rol valido', data: null })
						}
					})
					.catch(error => {

						message.error(response, { status: 422, message: '', data: error })
					})
			} else {
				message.failure(response, { status: 404, message: 'El usuario, no es un usuario valido', data: null })
			}
		})
		.catch(error => {

			message.error(response, { status: 422, message: '', data: error })
		})
}

function createDefaultUser(request, response, next) {
  User.findOne({username: settings.superuser})
    .then(user => {
      if (!user) {
        let superUser = new User({
          username: settings.superuser,
          password: 'super',
          status: 'ACTIVO'
        })

        superUser.save()
          .then(user => {
            console.log('SUPER USER CREATED')
            next()
          })
          .catch(error => {
            message.error(response, { status: 500, message: 'No se pudo crear el superusuario', data: null})
          })
      }
      next()
    })
    .catch(error => {
      message.error(response, {status: 500, message: 'No se pudo crear el super usuario', data: null})
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
