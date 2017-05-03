'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Brand = require('../models/brand')
const Person = require('../models/person')
const settings = require('../settings')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)
//Bloque principal de las pruebas de Marcas
describe('BRAND: ', () => {
	let token = ''

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
				// Test from here
				done()
			})
	})

	afterEach(done => {
		Brand.remove({}, error => { })
		Person.remove({}, error => { })
		done()
	})
	// GET /brands - Obtener todas las marcas
	describe('GET /brands', () => {
		it('deberia obtener todas las marcas', done => {
			chai.request(server)
				.get('/brands')
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
	// POST /brand - crear una nueva marca 
	describe('POST /brand', () => {
		it('deberia crear una nueva marca', done => {
			let brand = {
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			}

			chai.request(server)
				.post('/brand')
				.set('x-access-token', token)
				.send(brand)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message').eql('Marca creada con éxito')
					response.body.should.have.property('data')
					response.body.data.should.have.property('id').to.be.not.null
					done()
				})
		})

		it('no deberia crear una marca sin nombre', done => {
			let brand = {
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			}

			chai.request(server)
				.post('/brand')
				.set('x-access-token', token)
				.send(brand)
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Debe proporcionar un nombre para la marca')
					response.body.should.have.property('data').eql(null)
					done()
				})
		})
		//
		it('no deberia crear una marca con nombre duplicado', done => {
			let brand = {
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			}

			let newBrand = new Brand(brand)
			newBrand.save()
				.catch(error => console.error('TEST:', error))

			chai.request(server)
				.post('/brand')
				.set('x-access-token', token)
				.send(brand)
				.end((error, response) => {

					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('La Marca ya existe')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})
	// GET /brand/:brandId - obtener una marca por su id
	describe('GET /brand/:brandId', () => {
		it('deberia obtener una marca por su id', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			chai.request(server)
				.get('/brand/' + brand._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Marca obtenida con éxito')
					response.body.should.have.property('data')
					response.body.data.should.have.property('name')
						.eql('Loca cola')
					response.body.data.should.have.property('description')
						.eql('Bebida Gaseosa')
					response.body.data.should.have.property('suppliers')
					response.body.data.suppliers.should.be.a('array')
					response.body.data.suppliers.length.should.be.eql(0)
					done()
				})
		})

		it('no deberia obtener una marca con id de marca inválido', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			chai.request(server)
				.get('/brand/58dece08eb0548118ce31f11')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('No se encontró la marca')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})
	// PUT /brand/:brandId - actualizar una marca por su id
	describe('PUT /brand/:brandId', () => {
		it('deberia actualizar una marca por su id', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			chai.request(server)
				.put('/brand/' + brand._id)
				.set('x-access-token', token)
				.send({
					name: 'Exit cola',
					description: 'Otra bebida gaseosa',
					suppliers: []
				})
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Marca actualizada con éxito')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})

		it('no deberia actualizar una marca con id inválido', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			chai.request(server)
				.put('/brand/58dece08eb0548118ce31f11')
				.set('x-access-token', token)
				.send({
					name: 'Loca cola',
					description: 'Bebida Gaseosa',
					suppliers: []
				})
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('La marca, no es una marca valida')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})

		it('no deberia actualizar una marca con name duplicado', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			brand = new Brand({
				name: 'Exit cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			chai.request(server)
				.put('/brand/' + brand._id)
				.set('x-access-token', token)
				.send({
					name: 'Loca cola',
					description: 'Bebida Gaseosa',
					suppliers: []
				})
				.end((error, response) => {
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('La marca ya existe')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})
	// DELETE /brand/:brandId - elimina un usuario por su id
	describe('DELETE /brand/:brandId', () => {
		it('deberia eliminar una marca por su id', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			chai.request(server)
				.delete('/brand/' + brand._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Marca eliminada con éxito')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})

		it('no deberia eliminar una marca con id inválido', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			chai.request(server)
				.delete('/brand/58dece08eb0548118ce31f11')
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(404)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('La marca, no es una marca valida')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})

	// GET /brand/:userId/supplier
	describe('GET /brand/:userId/suppliers', () => {
		it('deberia obtener los proveedores de una marca', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				supplier: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			chai.request(server)
				.get('/brand/' + brand._id + '/suppliers')
				.set('x-access-token', token)
				.end((request, response) => {
					response.body.should.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Proveedores obtenidas con éxito')
					response.body.should.have.property('data')
					response.body.data.should.have.property('suppliers')
					response.body.data.suppliers.length.should.be.eql(0)
					done()
				})

		})
	})
	// POST /brand/:userId/supplier
	describe('POST /brand/:userId/suppliers', () => {
		it('deberia agregar un proveedor a una marca', done => {
			let brand = new Brand({
				name: 'Loca Cola',
				description: 'Bebida Gaseosa',
				supplier: [],
				status: 'ACTIVO'
			})

			brand.save()
				.catch(error => console.log('TEST:', error))

			let supplier = new Person({
				type: 'PROVEEDOR',
				businessName: 'La Estrella',
				addresses: [],
				taxStatus: 'RESPONSABLE INSCRIPTO',
				grossIncomeCode: '1220232021692',
				contacts: [],
				status: 'ACTIVO'
			})

			supplier.save()
				.catch(error => console.log('TEST:', error))


			chai.request(server)
				.post('/brand/' + brand._id + '/supplier')
				.set('x-access-token', token)
				.send({ supplierId: supplier._id })
				.end((request, response) => {
					response.body.should.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Proveedor agregado con éxito')
					response.body.should.have.property('data')
					response.body.data.length.should.be.eql(1)
					done()
				})
		})
	})
	// DELETE /brand/:brandID/supplier
	describe('DELETE /brand/:brandId/suppliers', () => {
		it('deberia eliminar los proveedores indicados', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				supplier: [],
				status: 'ACTIVO'
			})

			let suppliersIds = []

			let supplier = new Person({
				type: 'PROVEEDOR',
				businessName: 'La Estrella',
				addresses: [],
				taxStatus: 'RESPONSABLE INSCRIPTO',
				grossIncomeCode: '1220232021692',
				contacts: [],
				status: 'ACTIVO'
			})

			supplier.save()
				.catch(error => console.log('TEST:', error))

			suppliersIds.push(supplier._id)
			brand.suppliers.push(supplier._id)

			supplier = new Person({
				type: 'PROVEEDOR',
				businessName: 'The Star',
				addresses: [],
				taxStatus: 'RESPONSABLE INSCRIPTO',
				grossIncomeCode: '1220232021692',
				contacts: [],
				status: 'ACTIVO'
			})

			supplier.save()
				.catch(error => console.log('TEST:', error))

			suppliersIds.push(supplier._id)
			brand.suppliers.push(supplier._id)

			supplier = new Person({
				type: 'PROVEEDOR',
				businessName: 'The Morning Star',
				addresses: [],
				taxStatus: 'RESPONSABLE INSCRIPTO',
				grossIncomeCode: '1220232021692',
				contacts: [],
				status: 'ACTIVO'
			})

			supplier.save()
				.catch(error => console.log('TEST:', error))

			// suppliersIds.push(supplier._id)
			brand.suppliers.push(supplier._id)

			brand.save()
				.catch(error => console.log('TEST:', error))

			chai.request(server)
				.delete('/brand/' + brand._id + '/suppliers')
				.set('x-access-token', token)
				.send({ suppliers: JSON.stringify(suppliersIds) })
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Proveedores eliminados con éxito')
					response.body.should.have.property('data')
					response.body.data.should.be.a('array')
					done()
				})
		})
	})
})