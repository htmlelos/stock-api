'use strict';
// Establecemos la variable de ambien NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Business = require('../models/business')
const Role = require('../models/role')
const settings = require('../settings')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)
// Bloque principal de pruebas de roles
describe('ROLE: ', () => {

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
		Role.remove({}, error => { })
		Business.remove({}, error => { })
		done()
	})
	// GET /roles - Obtener todos los roles
	describe('GET /roles', () => {
		it('deberia obtener todos los roles', done => {

			chai.request(server)
				.get('/roles')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('')
					response.body.should.have.property('data')
					response.body.data.length.should.be.eql(0)
					done()
				})
		})
	})
	// POST /role - Crea un nuevo rol
	describe('POST /role', () => {
		it('deberia crear un nuevo rol', done => {
			let business = new Business({
				name: 'Punta del Agua',
				tributaryCode: '20232021692',
				status: 'ACTIVO'
			})
			business.save()
				.catch(error => { console.error('TEST--'.error) })

			let role = {
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				business: business._id,
				status: 'ACTIVO'
			}

			chai.request(server)
				.post('/role')
				.set('x-access-token', token)
				.send(role)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Rol creado con éxito')
					response.body.should.have.property('data')
					response.body.data.should.have.property('id')
						.to.be.not.null;
					done()
				})
		})
		it('no deberia crear un rol sin un nombre', done => {
			let business = new Business({
				name: 'Punta del Agua',
				tributaryCode: '20232021692',
				status: 'ACTIVO'
			})
			business.save()
				.catch(error => { console.error('TEST--'.error) })

			let role = {
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO',
				business: business._id
			}

			chai.request(server)
				.post('/role')
				.set('x-access-token', token)
				.send(role)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Debe proporcionar un nombre de Rol')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		//
		it('no deberia crear un rol sin descripcion', done => {
			let business = new Business({
				name: 'Punta del Agua',
				tributaryCode: '20232021692',
				status: 'ACTIVO'
			})
			business.save()
				.catch(error => {console.error('TEST--'. error)})						

			let role = {
				name: 'admin_role',
				status: 'ACTIVO',
				business: business._id
			}

			chai.request(server)
				.post('/role')
				.set('x-access-token', token)
				.send(role)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Debe proporcionar una descripción del Rol')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		//
		it('no deberia crear un rol sin estado', done => {

			let business = new Business({
				name: 'Punta del Agua',
				tributaryCode: '20232021692',
				status: 'ACTIVO'
			})
			business.save()
				.catch(error => {console.error('TEST--'. error)})


			let role = {
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				business: business._id
			}

			chai.request(server)
				.post('/role')
				.set('x-access-token', token)
				.send(role)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Debe definir el estado del Rol')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		//
		it('es estado del rol deberia ser ACTIVO or INACTIVO', done => {
			let business = new Business({
				name: 'Punta del Agua',
				tributaryCode: '20232021692',
				status: 'ACTIVO'
			})
			business.save()
				.catch(error => {console.error('TEST--'. error)})			

			let role = {
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'HABILITADO',
				business: business._id
			}

			chai.request(server)
				.post('/role')
				.set('x-access-token', token)
				.send(role)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El estado del Rol solo puede ser ACTIVO o INACTIVO')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		//
		it('no deberia crear un rol con nombre duplicado', done => {
			let business = new Business({
				name: 'Punta del Agua',
				tributaryCode: '20232021692',
				status: 'ACTIVO'
			})
			business.save()
				.catch(error => {console.error('TEST--'. error)})						
			
			let role = {
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO',
				business: business._id
			}

			let newRole = new Role(role)
			newRole.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.post('/role')
				.set('x-access-token', token)
				.send(role)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El Rol ya existe')
					response.body.should.have.property('data')
						.to.be.null
					done()
				})
		})
	})
	// GET /role/:roleId
	describe('GET /role/{roleId}', () => {
		it('deberia obtener un usario por su id', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.get('/role/' + role._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Rol obtenido con éxito')
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

		it('no deberia obtener un rol de usuario con un id de rol inválido', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.get('/role/58dece08eb0548118ce31f11')
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
	// PUT /role/:roleId
	describe('PUT /role/{roleId}', () => {
		it('deberia actualizar un rol por su id de rol', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

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
						.eql('Rol actualizado con éxito')
					response.body.should.have.property('data')
					response.body.data.should.be.a('object')
					done()
				})
		})
		it('no deberia actualizar un rol con un id de rol inválido', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

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
						.eql('El rol no es válido')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
		it('No deberia actualizar un rol con nombre duplicado', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

			role = new Role({
				name: 'developer_role',
				description: 'Un usuario con este rol, posee permisos de desarrollador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

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
						.eql('El Rol ya existe')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})
	// DELETE /role/:roleId
	describe('DELETE /role/{roleId}', () => {
		it('deberia eliminar un rol por su id', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/role/' + role._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Rol eliminado con éxito')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})

		it('no deberia eliminar un rol con un id de rol inválido', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.delete('/role/58dece08eb0548118ce31f11')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('El rol no es válido')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})
})