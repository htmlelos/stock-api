"use strict";
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const User = require('../models/user')
const Role = require('../models/role')
	// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()


describe('USERS TEST SUITE', () => {
	chai.use(chaiHttp)
		// Bloque principal de las pruebas de usuarios
	beforeEach(done => {
		User.remove({}, error => {})
		Role.remove({}, error => {})
		done()
	})

	// GET /users - Obtener todos los usuarios
	describe('GET /users', () => {
		it('should get all the users', done => {
			chai.request(server)
				.get('/users')
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message').eql('')
					response.body.should.have.property('data')
					response.body.data.length.should.be.eql(0)
					done()
				})
		})
	})

	// POST /user - Crea un usuario
	describe('POST /user', () => {
		it('should create a new user', done => {
				let user = {
					username: 'admin@mail.com',
					password: 'admin',
					status: 'ACTIVO'
				}

				chai.request(server)
					.post('/user')
					.send(user)
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message').eql('Usuario creado con exito')
						response.body.should.have.property('data').eql(null)
						done()
					})
			})
			// No deberia crear un usuario sin nombre de usuario
		it('should not create a new user without username', done => {
				let user = {
					password: 'admin',
					status: 'ACTIVO'
				}

				chai.request(server)
					.post('/user')
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
		it('should not create a new user without password', done => {
				let user = {
					username: 'admin@mail.com',
					status: 'ACTIVO'
				}

				chai.request(server)
					.post('/user')
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
		it('should not create a new user without status', done => {
				let user = {
					username: 'admin@mail.com',
					password: 'admin'
				}

				chai.request(server)
					.post('/user')
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
		it('user status should be ACTIVO or INACTIVO', done => {
			let user = {
				username: 'admin@mail.com',
				password: 'admin',
				status: 'HABILITADO'
			}

			chai.request(server)
				.post('/user')
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

		it('should not create a user with duplicate username', done => {
			let user = {
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			}

			let newUser = new User(user)
			newUser.save()
				.then(user => console.log())
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.post('/user')
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

	// GET /user/:userId
	describe('GET /user/:userId', () => {
			it('should get a user by its userId', done => {
				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'ACTIVO'
				})

				user.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.get('/user/' + user._id)
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('Usuario obtenido con exito')
						response.body.should.have.property('data')
						response.body.data.should.have.property('username')
							.eql('admin@mail.com')
						response.body.data.should.have.property('password')
							.eql('admin')
						response.body.data.should.have.property('status')
							.eql('ACTIVO')
						done()
					})
			})

			it('should not get a user with a invalid userId', done => {
				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'ACTIVO'
				})

				user.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.get('/user/58dece08eb0548118ce31f11')
					.end((error, response) => {
						response.should.have.status(404)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('No se encontró el usuario')
						response.body.should.have.property('data').eql(null)
						done()
					})
			})
		})
		//
	describe('PUT /user/:userId', () => {
			it('should update a user by its userId', done => {
				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'INACTIVO'
				})

				user.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.put('/user/' + user._id)
					.send({
						username: 'guest@mail.com',
						password: 'guest',
						status: 'ACTIVO'
					})
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('Usuario actualizado con exito')
						response.body.should.have.property('data')
						response.body.data.should.have.property('username')
							.eql('guest@mail.com')
						response.body.data.should.have.property('password')
							.eql('guest')
						response.body.data.should.have.property('status')
							.eql('ACTIVO')
						done()
					})
			})

			it('should not update a user with a invalid userId', done => {
				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'INACTIVO'
				})

				user.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.put('/user/58dece08eb0548118ce31f11')
					.send({
						username: 'guest@mail.com',
						password: 'guest',
						status: 'ACTIVO'
					})
					.end((error, response) => {
						response.should.have.status(404)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('El usuario, no es un usuario valido')
						response.body.should.have.property('data').eql(null)
						done()
					})
			})

			it('should not update a user to a duplicate username', done => {
				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'INACTIVO'
				})

				user.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

				user = new User({
					username: 'developer@mail.com',
					password: 'developer',
					status: 'ACTIVO'
				})

				user.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.put('/user/' + user._id)
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
		//
	describe('DELETE /user/:userId', () => {
		it('should delete a user by its id', done => {
				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'ACTIVO'
				})

				user.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.delete('/user/' + user._id)
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('Usuario eliminado con exito')
						response.body.should.have.property('data').eql(null)
						done()
					})
			})
			//
		it('shoud not delete a user with a invalid userId', done => {
			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.save()
				.then(user => console.log(''))
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/user/58dece08eb0548118ce31f11')
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El usuario, no es un usuario valido')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
	})

	// POST /user/:userId/role
	describe('POST /user/:userId/role', () => {
			it('should add a role to a user by its userId', done => {
				let role = new Role({
					name: 'admin',
					description: 'un usuario con este rol posee permisos de administrador2',
					status: 'ACTIVO'
				})
				role.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'ACTIVO'
				})

				user.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.post('/user/' + user._id + '/role')
					.send({ roleId: role._id.toString() })
					.end((error, response) => {

						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('El rol se añadio con exito')
						response.body.should.have.property('data').eql(null)
						done()
					})
			})

			it('should not add a role if the user does not exist', done => {
				let role = new Role({
					name: 'admin',
					description: 'un usuario con este rol posee permisos de administrador',
					status: 'ACTIVO'
				})

				role.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'ACTIVO'
				})

				user.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.post('/user/57e672270b235925dcde798d/role')
					.send({ roleId: role._id.toString() })
					.end((error, response) => {
						response.should.have.status(404)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('El usuario, no es un usuario valido')
						response.body.should.have.property('data').eql(null)
						done()
					})
			})

			//
			it('should not add a role to a user if the role is invalid', done => {
					let role = new Role({
						name: 'admin',
						description: 'un usuario con este rol posee permisos de administrador',
						status: 'ACTIVO'
					})
					role.save()
						.then(role => console.log(''))
						.catch(error => console.error('TEST:', error))

					let user = new User({
						username: 'admin@mail.com',
						password: 'admin',
						status: 'ACTIVO'
					})

					user.save()
						.then(role => console.log(''))
						.catch(error => console.error('TEST:', error))

					chai.request(server)
						.post('/user/' + user._id + '/role')
						.send({ roleId: '58b9a7b446c74f540ce99cad' })
						.end((error, response) => {
							response.should.have.status(404)
							response.body.should.be.a('object')
							response.body.should.have.property('message')
								.eql('El rol, no es un rol valido')
							response.body.should.have.property('data').eql(null)
							done()
						})
				})
				//
			it('should not add a empty role to a user', done => {
					let role = new Role({
						name: 'admin',
						description: 'un usuario con este rol posee permisos de administrador',
						status: 'ACTIVO'
					})

					role.save()
						.then(role => console.log(''))
						.catch(error => console.error('TEST:', error))

					let user = new User({
						username: 'admin@mail.com',
						password: 'admin',
						status: 'ACTIVO'
					})

					user.save()
						.then(role => console.log(''))
						.catch(error => console.error('TEST:', error))

					chai.request(server)
						.post('/user/' + user._id + '/role')
						.send({ roleId: '' })
						.end((error, response) => {
							response.should.have.status(422)
							response.body.should.be.a('object')
							response.body.should.have.property('message')
								.eql('El rol, no es un rol valido')
							response.body.should.have.property('data').eql(null)
							done()
						})
				})
				//
			it('should not add a role to a user if the role is already exist', done => {
				let role = new Role({
					name: 'guest',
					description: 'un usuario con este rol posee permisos restringidos',
					status: 'ACTIVO'
				})

				role.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				let user = new User({
					username: 'guest@mail.com',
					password: 'guest',
					status: 'ACTIVO'
				})

				user.roles.push(role.name)
				user.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.post('/user/' + user._id + '/role')
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
		//
	describe('GET /user/:userId/roles', () => {
			it('should get all the roles from a user', done => {
				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'ACTIVO'
				})
				user.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.get('/user/' + user._id + '/roles')
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message').eql('')
						response.body.should.have.property('data')
						response.body.data.length.should.be.eql(0)
						done()
					})
			})
		})
		//
	describe('DELETE /user/:userId/role/:roleId', () => {
		it('should delete a role by its roleId from a user', done => {
				let role = new Role({
					name: 'guest',
					description: 'un usuario con este rol posee permisos restringidos',
					status: 'ACTIVO'
				})
				role.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'ACTIVO'
				})

				user.roles.push(role._id)
				user.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.delete('/user/' + user._id + '/role/' + role._id)
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('Rol revocado con exito')
						response.body.should.have.property('data').eql(null)
						done()
					})
			})
			//
		it('should not delete role of a invalid user id', done => {
				let role = new Role({
					name: 'guest',
					description: 'un usuario con este rol posee permisos restringidos',
					status: 'ACTIVO'
				})
				role.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				let user = new User({
					username: 'admin@mail.com',
					password: 'admin',
					status: 'ACTIVO'
				})

				user.roles.push(role._id)
				user.save()
					.then(role => console.log(''))
					.catch(error => console.error('TEST:', error))

				chai.request(server)
					.delete('/user/58dece08eb0548118ce31f11/role/' + role._id)
					.end((error, response) => {
						response.should.have.status(404)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('El usuario, no es un usuario valido')
						response.body.should.have.property('data')
							.eql(null)
						done()
					})
			})
			//
		it('should not delete a role what is not assigned to user', done => {
			let role = new Role({
				name: 'guest',
				description: 'un usuario con este rol posee permisos restringidos',
				status: 'ACTIVO'
			})

			role.save()
				.then(role => console.log(''))
				.catch(error => console.error('TEST:', error))

			let user = new User({
				username: 'admin@mail.com',
				password: 'admin',
				status: 'ACTIVO'
			})

			user.roles.push(role._id)
			user.save()
				.then(role => console.log(''))
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/user/' + user._id + '/role/58dece08eb0548118ce31f11')
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message').eql('El rol, no es un rol valido')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
	})
})
