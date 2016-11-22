'use strict';
// Establecemos la variable de ambien NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Role = require('../models/role')
const settings = require('../settings.cfg')
	// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)
	// Bloque principal de pruebas de roles
describe('ROLE TEST SUITE', () => {
	beforeEach(done => {
			Role.remove({}, error => {
				done()
			})
		})
		// GET /roles - Obtener todos los roles
	describe('GET /roles', () => {
			it('deberia obtener todos los roles', done => {
				let user = {
					username: 'admin@mail.com',
					password: 'admin'
				}

				let token = jwt.sign(user, settings.secret, {
					expiresIn: "8h"
				})

				chai.request(server)
					.get('/roles')
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
		})
		// POST /role - Crea un nuevo rol
	describe('POST /role', () => {
			it('deberia crear un nuevo rol', done => {
				let role = {
					name: 'admin_role',
					description: 'Un usuario con este rol, posee permisos de administrador',
					status: 'ACTIVO'
				}

				let user = {
					username: 'admin@mail.com',
					password: 'admin'
				}

				let token = jwt.sign(user, settings.secret, {
					expiresIn: "8h"
				})

				chai.request(server)
					.post('/role')
					.set('x-access-token', token)
					.send(role)
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('Rol creado con exito')
						response.body.should.have.property('data').eql(null)
						done()
					})
			})

			it('no deberia crear un rol sin un nombre', done => {
					let role = {
						description: 'Un usuario con este rol, posee permisos de administrador',
						status: 'ACTIVO'
					}

					let user = {
						username: 'admin@mail.com',
						password: 'admin'
					}

					let token = jwt.sign(user, settings.secret, {
						expiresIn: "8h"
					})

					chai.request(server)
						.post('/role')
						.set('x-access-token', token)
						.send(role)
						.end((error, response) => {
							response.should.have.status(422)
							response.body.should.be.a('object')
							response.body.should.have.property('message')
								.eql('Debe proporcionar un nombre de rol')
							response.body.should.have.property('data').eql(null)
							done()
						})
				})
				//
			it('no deberia crear un rol sin descripcion', done => {
					let role = {
						name: 'admin_role',
						status: 'ACTIVO'
					}

					let user = {
						username: 'admin@mail.com',
						password: 'admin'
					}

					let token = jwt.sign(user, settings.secret, {
						expiresIn: "8h"
					})

					chai.request(server)
						.post('/role')
						.set('x-access-token', token)
						.send(role)
						.end((error, response) => {
							response.should.have.status(422)
							response.body.should.be.a('object')
							response.body.should.have.property('message')
								.eql('Debe proporcionar una descripcion del rol')
							response.body.should.have.property('data').eql(null)
							done()
						})
				})
				//
			it('no deberia crear un rol sin estado', done => {
					let role = {
						name: 'admin_role',
						description: 'Un usuario con este rol, posee permisos de administrador',
					}

					let user = {
						username: 'admin@mail.com',
						password: 'admin'
					}

					let token = jwt.sign(user, settings.secret, {
						expiresIn: "8h"
					})

					chai.request(server)
						.post('/role')
						.set('x-access-token', token)
						.send(role)
						.end((error, response) => {
							response.should.have.status(422)
							response.body.should.be.a('object')
							response.body.should.have.property('message')
								.eql('Debe definir el estado del rol')
							response.body.should.have.property('data').eql(null)
							done()
						})
				})
				//
			it('es estado del rol deberia ser ACTIVO or INACTIVO', done => {
					let role = {
						name: 'admin_role',
						description: 'Un usuario con este rol, posee permisos de administrador',
						status: 'HABILITADO'
					}

					let user = {
						username: 'admin@mail.com',
						password: 'admin'
					}

					let token = jwt.sign(user, settings.secret, {
						expiresIn: "8h"
					})

					chai.request(server)
						.post('/role')
						.set('x-access-token', token)
						.send(role)
						.end((error, response) => {
							response.should.have.status(422)
							response.body.should.be.a('object')
							response.body.should.have.property('message')
								.eql('El estado del rol solo puede ser ACTIVO o INACTIVO')
							response.body.should.have.property('data').eql(null)
							done()
						})
				})
				//
			it('no deberia crear un rol con nombre duplicado', done => {
				let role = {
					name: 'admin_role',
					description: 'Un usuario con este rol, posee permisos de administrador',
					status: 'ACTIVO'
				}

				let newRole = new Role(role)
				newRole.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

					let user = {
						username: 'admin@mail.com',
						password: 'admin'
					}

					let token = jwt.sign(user, settings.secret, {
						expiresIn: "8h"
					})

				chai.request(server)
					.post('/role')
					.set('x-access-token', token)
					.send(role)
					.end((error, response) => {
						response.should.have.status(422)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('El rol ya existe')
						response.body.should.have.property('data').eql(null)
						done();
					})
			})
		})
		//
	describe('GET /role/:roleId', () => {
			it('deberia obtener un usario por su id', done => {
				let role = new Role({
					name: 'admin_role',
					description: 'Un usuario con este rol, posee permisos de administrador',
					status: 'ACTIVO'
				})

				role.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

					let user = {
						username: 'admin@mail.com',
						password: 'admin'
					}

					let token = jwt.sign(user, settings.secret, { expiresIn: '8h' })

				chai.request(server)
					.get('/role/' + role._id)
					.set('x-access-token', token)
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('Rol obtenido con exito')
						response.body.should.have.property('data')
						response.body.data.should.have.property('name')
							.eql('admin_role')
						response.body.data.should.have.property('description')
							.eql('Un usuario con este rol, posee permisos de administrador')
						response.body.data.should.have.property('status')
							.eql('ACTIVO')
						done()
					})
			})

			it('no deberia obtener un rol de usuario con un id de rol invalido', done => {
				let role = new Role({
					name: 'admin_role',
					description: 'Un usuario con este rol, posee permisos de administrador',
					status: 'ACTIVO'
				})

				role.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

					let user = {
						username: 'admin@mail.com',
						password: 'admin'
					}

					let token = jwt.sign(user, settings.secret, {
						expiresIn: "8h"
					})

				chai.request(server)
					.get('/role/58dece08eb0548118ce31f11')
					.set('x-access-token', token)
					.end((error, response) => {
						response.should.have.status(404)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('No se encontro el rol')
						response.body.should.have.property('data').eql(null)
						done()
					})
			})
		})
		//
	describe('/PUT /role/:roleId', () => {
			it('deberia actualizar un rol por su id de rol', done => {
				let role = new Role({
					name: 'admin_role',
					description: 'Un usuario con este rol, posee permisos de administrador',
					status: 'ACTIVO'
				})

				role.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

				let user = {
					username: 'admin@mail.com',
					password: 'admin'
				}

				let token = jwt.sign(user, settings.secret, {
					expiresIn: "8h"
				})

				chai.request(server)
					.put('/role/' + role._id)
					.set('x-access-token', token)
					.send({
						name: 'developer_role',
						description: 'Un usuario con este rol, posee permisos de desarrollador',
						status: 'INACTIVO'
					})
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('Rol actualizado con exito')
						response.body.should.have.property('data').to.be.null
						done()
					})
			})

			it('no deberia actualizar un rol con un id de rol invalido', done => {
					let role = new Role({
						name: 'admin_role',
						description: 'Un usuario con este rol, posee permisos de administrador',
						status: 'ACTIVO'
					})

					role.save()
						.then(user => console.log())
						.catch(error => console.error('TEST:', error))

					let user = {
						username: 'admin@mail.com',
						password: 'admin'
					}

					let token = jwt.sign(user, settings.secret, {
						expiresIn: "8h"
					})

					chai.request(server)
						.put('/role/58dece08eb0548118ce31f11')
						.set('x-access-token', token)
						.send({
							name: 'developer_role',
							description: 'Un usuario con este rol, posee permisos de desarrollador',
							status: 'INACTIVO'
						})
						.end((error, response) => {
							response.should.have.status(404)
							response.body.should.be.a('object')
							response.body.should.have.property('message')
								.eql('El rol, no es un rol valido')
							done()
						})
				})

				it('should not update a role to a duplicate name', done => {
					let role = new Role({
						name: 'admin_role',
						description: 'Un usuario con este rol, posee permisos de administrador',
						status: 'ACTIVO'
					})

					role.save()
						.then(user => console.log())
						.catch(error => console.error('TEST:', error))

					role = new Role({
						name: 'developer_role',
						description: 'Un usuario con este rol, posee permisos de desarrollador',
						status: 'ACTIVO'
					})

					role.save()
						.then(user => console.log())
						.catch(error => console.error('TEST:', error))

            let user = {
              username: 'admin@mail.com',
              password: 'admin'
            }

            let token = jwt.sign(user, settings.secret, {
              expiresIn: "8h"
            })

					chai.request(server)
						.put('/role/' + role._id)
            .set('x-access-token', token)
						.send({
							name: 'admin_role',
							description: 'Un usuario con este rol, posee permisos de desarrollador',
							status: 'INACTIVO'
						})
						.end((error, response) => {
							response.should.have.status(422)
							response.body.should.be.a('object')
							response.body.should.have.property('message')
								.eql('El rol ya existe')
							done()
						})
				})
		})
		//
		describe('DELETE /role/:roleId', () => {
			it('deberia eliminar un rol por su id', done => {
				let role = new Role({
					name: 'admin_role',
					description: 'Un usuario con este rol, posee permisos de administrador',
					status: 'ACTIVO'
				})

				role.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

          let user = {
            username: 'admin@mail.com',
            password: 'admin'
          }

          let token = jwt.sign(user, settings.secret, {
            expiresIn: "8h"
          })

				chai.request(server)
					.delete('/role/' + role._id)
          .set('x-access-token', token)
					.end((error, response) => {
						response.should.have.status(200)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('Rol eliminado con exito')
            response.body.should.have.property('data').to.be.null
						done()
					})
			})

			it('no deberia eliminar un rol con un id de rol invalido', done => {
				let role = new Role({
					name: 'admin_role',
					description: 'Un usuario con este rol, posee permisos de administrador',
					status: 'ACTIVO'
				})

				role.save()
					.then(user => console.log())
					.catch(error => console.error('TEST:', error))

          let user = {
            username: 'admin@mail.com',
            password: 'admin'
          }

          let token = jwt.sign(user, settings.secret, {
            expiresIn: "8h"
          })

				chai.request(server)
					.delete('/role/58dece08eb0548118ce31f11')
          .set('x-access-token', token)
					.end((error, response) => {
						response.should.have.status(404)
						response.body.should.be.a('object')
						response.body.should.have.property('message')
							.eql('El rol, no es un rol valido')
            response.body.should.have.property('data').to.be.null
						done()
					})
			})
		})
})
