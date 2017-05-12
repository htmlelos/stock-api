'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/user')
const Role = require('../models/role')
const settings = require('../settings')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

// Bloque principal de las pruebas de usuarios
describe('USERS: test suite', () => {
	let token = ''
	// Se ejecuta antes de cada test
	beforeEach(done => {
		let superUser = {
			username: 'super@mail.com',
			password: 'super'
		}
		chai.request(server)
			.post('/login')
			.send(superUser)
			.end((error, response) => {
				response.should.be.status(200)
				response.body.should.have.property('data')
				response.body.data.should.have.property('token')
				token = response.body.data.token
				done()
			})
	})
	// Se ejecuta despues de cada test
	afterEach(done => {
		User.remove({}, error => { })
		Role.remove({}, error => { })
		done()
	})
	// Obtener todos los usuarios
	describe('GET /users', () => {
		it('deberia obtener todos los usuarios', done => {
			chai.request(server)
				.get('/users')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message').eql('')
					response.body.should.have.property('data')
					response.body.data.should.be.a('array')
					response.body.data.length.should.be.eql(1)
					done()
				})
		})
	})
	// Recuperar todos los usuarios	
	describe('POST /users', () => {
		it('deberia obtener todos los usarios seleccionados', done => {
			let params = {
				limit: "",
				fields: "status name",
				filter: { status: "ACTIVO" },
				sort: { username: 1 }
			}

			chai.request(server)
				.post('/users')
				.set('x-access-token', token)
				.send(params)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message').eql('')
					response.body.should.have.property('data')
					response.body.data.should.be.a('array')
					// response.body.data.should.have.property('status')
					// response.body.data.should.have.property('name')
					done()
				})
		})
	})
	// Crea un usuario
	describe('POST /user', () => {
		it('deberia crear un nuevo usuario', done => {
			let user = {
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			}

			chai.request(server)
				.post('/user')
				.set('x-access-token', token)
				.send(user)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message').eql('Usuario creado con éxito')
					response.body.should.have.property('data')
					response.body.data.should.have.property('id').to.be.not.null
					done()
				})
		})
		// No deberia crear un usuario sin nombre de usuario
		it('no deberia crear un usuario sin username', done => {
			let user = {
				password: 'admin',
				status: 'ACTIVO'
			}

			chai.request(server)
				.post('/user')
				.set('x-access-token', token)
				.send(user)
				.end((error, response) => {

					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Debe proporcionar un nombre de usuario')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		// No deberia crear un usuario sin la contraseña
		it('no deberia crear un usuario sin contraseña', done => {
			let user = {
				username: 'admin@mail.com',
				status: 'ACTIVO'
			}

			chai.request(server)
				.post('/user')
				.set('x-access-token', token)
				.send(user)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Debe proporcionar una contraseña')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		// No deberia crear un usuario sin estado
		it('no deberia crear un nuevo usuario sin estado', done => {
			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			chai.request(server)
				.post('/user')
				.set('x-access-token', token)
				.send(user)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Debe definir el estado del usuario')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		// El valor del estado deberia ser ACTIVO o INACTIVO
		it('el estado deberia ser ACTIVO or INACTIVO', done => {
			let user = {
				username: 'admin@mail.com',
				password: 'admin',
				status: 'HABILITADO'
			}

			chai.request(server)
				.post('/user')
				.set('x-access-token', token)
				.send(user)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El estado de usuario solo puede ser ACTIVO o INACTIVO')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})

		it('no deberia crear un usuario con nombre duplicado', done => {
			let user = {
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			}

			let newUser = new User(user)
			newUser.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.post('/user')
				.set('x-access-token', token)
				.send(user)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El usuario ya existe')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
	})
	// Obtener un usuario por su userId
	describe('GET /user/{userId}', () => {
		it('deberia obtener un usuario por su id', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.get('/user/' + user._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Usuario obtenido con éxito')
					response.body.should.have.property('data')
					response.body.data.should.have.property('username')
						.eql('admin@mail.com')
					response.body.data.should.have.property('status')
						.eql('ACTIVO')
					done()
				})
		})
		it('no deberia obtener un usuario con id de usuario inválido', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.get('/user/58dece08eb0548118ce31f11')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('No se encontró el usuario')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})
	// Actualiza un usuario
	describe('PUT /user/{userId}', () => {
		it('deberia actualizar un usuario por su id de usuario', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'INACTIVO'
			})

			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.put('/user/' + user._id)
				.set('x-access-token', token)
				.send({
					username: 'guest@mail.com',
					password: 'guest',
					status: 'ACTIVO'
				})
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Usuario actualizado con éxito')
					response.body.should.have.property('data')
					response.body.data.should.be.a('object')
					done()
				})
		})
		it('no deberia actualizar un usuario con un id de usuario inválido', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'INACTIVO'
			})

			user.save()

				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.put('/user/58dece08eb0548118ce31f11')
				.set('x-access-token', token)
				.send({
					username: 'guest@mail.com',
					password: 'guest',
					status: 'ACTIVO'
				})
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El usuario no es válido')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		it('no deberia actualizar un usuario con username duplicado', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'INACTIVO'
			})

			user.save()

				.catch(error => console.error('TEST:', error))

			user = new User({
				username: 'developer@mail.com',
				password: 'developer',
				status: 'ACTIVO'
			})

			user.save()

				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.put('/user/' + user._id)
				.set('x-access-token', token)
				.send({
					username: 'admin@mail.com',
					password: 'guest',
					status: 'ACTIVO'
				})
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El usuario ya existe')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
	})
	// Eliminar un usuario
	describe('DELETE /user/{userId}', () => {
		it('deberia eliminar un usuario por su id', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()

				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/user/' + user._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Usuario eliminado con éxito')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
		//
		it('no deberia eliminar un usuario con id de usuario inválido', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()

				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/user/58dece08eb0548118ce31f11')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El usuario no es válido')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})
	// Añadir un rol a un usuario
	describe('POST /user/{userId}/role', () => {
		// Deberia agregar un rol a un usuario por su id
		it('deberia agregar un rol a un usuario por su id', done => {
			let role = new Role({
				name: 'admin',
				description: 'un usuario con este rol posee permisos de administrador2',
				status: 'ACTIVO'
			})
			role.save()

				.catch(error => console.error('TEST:', error))

			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()
				.catch(error => console.error('TEST:', error))

			let newRole = { roleId: role._id.toString() }

			chai.request(server)
				.post('/user/' + user._id + '/role')
				.set('x-access-token', token)
				.send(newRole)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El rol se añadio con éxito')
					response.body.should.have.property('data')
					response.body.data.should.be.a('array')
					response.body.data.length.should.be.eql(1)
					done()
				})
		})
		//
		it('no deberia agregar un rol si el usuario no existe', done => {
			let role = new Role({
				name: 'admin',
				description: 'un usuario con este rol posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.post('/user/57e672270b235925dcde798d/role')
				.set('x-access-token', token)
				.send({ roleId: role._id.toString() })
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('No se encontró el Usuario')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		//
		it('no deberia agregar un rol si el rol es inválido', done => {
			let role = new Role({
				name: 'admin',
				description: 'un usuario con este rol posee permisos de administrador',
				status: 'ACTIVO'
			})
			role.save()
				.catch(error => console.error('TEST:', error))

			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.post('/user/' + user._id + '/role')
				.set('x-access-token', token)
				.send({ roleId: '58b9a7b446c74f540ce99cad' })
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('No se encontró el Rol')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		//
		it('no deberia agregar un rol vacio a un usuario', done => {
			let role = new Role({
				name: 'admin',
				description: 'un usuario con este rol posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.post('/user/' + user._id + '/role')
				.set('x-access-token', token)
				.send({ roleId: '' })
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El rol no es válido')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		//
		it('no deberia agregar un rol al usuario si el rol ya se encuentra asociado', done => {
			let role = new Role({
				name: 'guest',
				description: 'un usuario con este rol posee permisos restringidos',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

			let user = new User({
				username: 'guest@mail.com',
				password: 'guest',
				status: 'ACTIVO'
			})

			user.roles.push(role._id)
			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.post('/user/' + user._id + '/role')
				.set('x-access-token', token)
				.send({ roleId: role._id })
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El rol ya se encuentra asociado al usuario')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
	})
	// Obtener los roles de un usuario
	describe('GET /user/{userId}/roles', () => {
		it('deberia obtener todos los roles de un usuario', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})
			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.get('/user/' + user._id + '/roles')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message').eql('')
					response.body.should.have.property('data')
					response.body.data.length.should.be.eql(0)
					done()
				})
		})

		it('no deberia obtener los roles de usuario si el usuario es invalido', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.get('/user/57e672270b235925dcde798d/roles')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message').eql('El usuario no es un usuario válido')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})
	// Revocar los roles indicados de un usuario
	describe('DELETE /user/{userId}/roles', () => {
		it('deberia eliminar los roles indicados del usuario', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			let rolesIds = []

			let role = new Role({
				name: 'accountant',
				description: 'accountant manager',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))
			rolesIds.push(role._id)
			user.roles.push(role._id)

			role = new Role({
				name: 'cashier',
				description: 'cashier operator',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))
			// rolesIds.push(role._id)
			user.roles.push(role._id)

			role = new Role({
				name: 'dispatcher',
				description: 'dispatcher operador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))
			rolesIds.push(role._id)
			user.roles.push(role._id)

			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/user/' + user._id + '/roles')
				.set('x-access-token', token)
				.send({ roles: JSON.stringify(rolesIds) })
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
					response.body.should.have.property('data')
					response.body.data.should.be.a('array')
					done()
				})
		})
	})
	// Revocar un rol de un usuario
	describe('DELETE /user/:userId/role/:roleId', () => {
		it('deberia eliminar un rol de un usuario por su id de rol', done => {
			let role = new Role({
				name: 'guest',
				description: 'un usuario con este rol posee permisos restringidos',
				status: 'ACTIVO'
			})
			role.save()
				.catch(error => console.error('TEST:', error))

			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.roles.push(role._id)
			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/user/' + user._id + '/role/' + role._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Rol revocado con éxito')
					response.body.should.have.property('data')
					response.body.data.should.be.a('array')
					response.body.data.length.should.be.eql(0)
					done()
				})
		})
		//
		it('no deberia eliminar un rol de un usuario inválido', done => {
			let role = new Role({
				name: 'guest',
				description: 'un usuario con este rol posee permisos restringidos',
				status: 'ACTIVO'
			})
			role.save()
				.catch(error => console.error('TEST:', error))

			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.roles.push(role._id)
			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/user/58dece08eb0548118ce31f11/role/' + role._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('No se encontró el usuario')
					response.body.should.have.property('data')
						.eql(null)
					done()
				})
		})
		//
		it('no deberia revocar un rol que no esta asignado al usuario', done => {
			let role = new Role({
				name: 'guest',
				description: 'un usuario con este rol posee permisos restringidos',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.roles.push(role._id)
			user.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/user/' + user._id + '/role/58dece08eb0548118ce31f11')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('No se encontró el rol')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
	})
	// Agregar un perfil de usuario
	describe.skip('POST /user/:userId/profile', () => {
		// Pendiente
		it('deberia agregar un perfil a un usuario', done => { })
	})
	// Obtener un perfil de usuario
	describe.skip('GET /user/:userId/profiles', () => {
		// Pendiente
		it('deberia obtener todos los perfiles de un usuario')
	})
	// Revocar un perfil de usuario
	describe.skip('DELETE //user/:userId/profile', () => {
		// Pendiente
		// it('deberia eliminar un perfil de un usuario')
	})
})