"use strict";
// Establecemos la variable de ambien NODE_ENV a test
process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const Role = require('../models/role')
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
			it('should get all the users', done => {
				chai.request(server)
					.get('/roles')
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
		it('should create a new role', done => {
			let role = {
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			}

			chai.request(server)
				.post('/role')
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

		it('should not create a role without a name', done => {
			let role = {
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			}

			chai.request(server)
				.post('/role')
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
		it('should not create a role without description', done => {
			let role = {
				name: 'admin_role',
				status: 'ACTIVO'
			}

			chai.request(server)
				.post('/role')
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
		it('should not create a role without status', done => {
			let role = {
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
			}

			chai.request(server)
				.post('/role')
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
		it('role status should be ACTIVO or INACTIVO', done => {
			let role = {
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'HABILITADO'
			}

			chai.request(server)
				.post('/role')
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
		it('should not create a rol with duplicate name', done => {
			let role = {
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			}

			let newRole = new Role(role)
			newRole.save()
				.then(user => console.log())
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.post('/role')
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
		it('should get a user by its roleId', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.then(user => console.log())
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.get('/role/' + role._id)
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

		it('should not get a role with a invalid roleId', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.then(user => console.log())
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.get('/role/58dece08eb0548118ce31f11')
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
		it('should update a role by its roleId', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.then(user => console.log())
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.put('/role/' + role._id)
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
					response.body.should.have.property('data')
					// response.body.data.should.have.property('name')
					// 	.eql('developer_role')
					// response.body.data.should.have.property('description')
					// 	.eql('Un usuario con este rol, posee permisos de desarrollador')
					// response.body.data.should.have.property('status')
					// 	.eql('INACTIVO')
					done()
				})
		})

		it('should not update a role with a invalid roleId', done => {
			let role = new Role({
				name: 'admin_role',
				description: 'Un usuario con este rol, posee permisos de administrador',
				status: 'ACTIVO'
			})

			role.save()
				.then(user => console.log())
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.put('/role/58dece08eb0548118ce31f11')
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
    //
		// it('should not update a role to a duplicate name', done => {
		// 	let role = new Role({
		// 		name: 'admin_role',
		// 		description: 'Un usuario con este rol, posee permisos de administrador',
		// 		status: 'ACTIVO'
		// 	})
    //
		// 	role.save()
		// 		.then(user => console.log())
		// 		.catch(error => console.error('TEST:', error))
    //
		// 	role = new Role({
		// 		name: 'developer_role',
		// 		description: 'Un usuario con este rol, posee permisos de desarrollador',
		// 		status: 'ACTIVO'
		// 	})
    //
		// 	role.save()
		// 		.then(user => console.log())
		// 		.catch(error => console.error('TEST:', error))
    //
		// 	chai.request(server)
		// 		.put('/role/' + role._id)
		// 		.send({
		// 			name: 'admin_role',
		// 			description: 'Un usuario con este rol, posee permisos de desarrollador',
		// 			status: 'INACTIVO'
		// 		})
		// 		.end((error, response) => {
		// 			response.should.have.status(422)
		// 			response.body.should.be.a('object')
		// 			response.body.should.have.property('message')
		// 				.eql('El rol ya existe')
		// 			done()
		// 		})
		// })
	})
  //
	// describe('DELETE /role/:roleId', () => {
	// 	it('should delete a role by its roleId', done => {
	// 		let role = new Role({
	// 			name: 'admin_role',
	// 			description: 'Un usuario con este rol, posee permisos de administrador',
	// 			status: 'ACTIVO'
	// 		})
  //
	// 		role.save()
	// 			.then(user => console.log())
	// 			.catch(error => console.error('TEST:', error))
  //
	// 		chai.request(server)
	// 			.delete('/role/' + role._id)
	// 			.end((error, response) => {
	// 				response.should.have.status(200)
	// 				response.body.should.be.a('object')
	// 				response.body.should.have.property('message')
	// 					.eql('Rol eliminado con exito')
	// 				done()
	// 			})
	// 	})
  //
	// 	it('should not delete a role with a invalid roleId', done => {
	// 		let role = new Role({
	// 			name: 'admin_role',
	// 			description: 'Un usuario con este rol, posee permisos de administrador',
	// 			status: 'ACTIVO'
	// 		})
  //
	// 		role.save()
	// 			.then(user => console.log())
	// 			.catch(error => console.error('TEST:', error))
  //
	// 		chai.request(server)
	// 			.delete('/role/58dece08eb0548118ce31f11')
	// 			.end((error, response) => {
	// 				response.should.have.status(404)
	// 				response.body.should.be.a('object')
	// 				response.body.should.have.property('message')
	// 					.eql('El rol, no es un rol valido')
	// 				done()
	// 			})
	// 	})
	// })
})
