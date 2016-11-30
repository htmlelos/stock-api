'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Brand = require('../models/brand')
const Supplier = require('../models/supplier')
const settings = require('../settings.cfg')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)
//Bloque principal de las pruebas de Marcas
describe('BRAND TEST SUITE', () => {	
	beforeEach(done => {
		Brand.remove({}, error => { })
		Supplier.remove({}, error => { })
		done()
	})

	// GET /brands - Obtener todas las marcas
	describe('GET /brands', () => {
		it('deberia obtener todas las marcas', done => {
			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

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

	describe('POST /brand', () => {
		it('deberia crear una nueva marca', done => {
			let brand = {
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: []
			}

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

			chai.request(server)
				.post('/brand')
				.set('x-access-token', token)
				.send(brand)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message').eql('Marca creada con exito')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})

		it('no deberia crear una marca sin nombre', done => {
			let brand = {
				description: 'Bebida Gaseosa',
				suppliers: []
			}

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

			chai.request(server)
				.post('/brand')
				.set('x-access-token', token)
				.send(brand)
				.end((error, response) => {
					// console.log('::RESPONSE-BODY::', response.body);
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
				suppliers: []
			}

			let newBrand = new Brand(brand)
			newBrand.save()
				.then(brand => console.log())
				.catch(error => console.error('TEST:', error))

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

			chai.request(server)
				.post('/brand')
				.set('x-access-token', token)
				.send(brand)
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
	// GET /user/:userId - obtener un usuario por su id
	describe('GET /user/:userId', () => {
		it('deberia obtener una marca por su id', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: []
			})

			brand.save()
				.then(brand => console.log())
				.catch(error => console.log('TEST:', error))

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

			chai.request(server)
				.get('/brand/' + brand._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Marca obtenida con exito')
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

		it('no deberia obtener una marca con id de marca invalido', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: []
			})

			brand.save()
				.then(brand => console.log())
				.catch(error => console.log('TEST:', error))

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

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
	// PUT /user/:userId - actualizar un usuario por su id
	describe('PUT /user/:userId', () => {
		it('deberia actualizar una marca por su id', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: []
			})

			brand.save()
				.then(brand => console.log())
				.catch(error => console.log('TEST:', error))

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

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
						.eql('Marca actualizada con exito')
					response.body.should.have.property('data')
					response.body.data.should.have.property('name')
						.eql('Exit cola')
					response.body.data.should.have.property('description')
						.eql('Otra bebida gaseosa')
					response.body.data.should.have.property('suppliers')
					response.body.data.suppliers.should.to.be.a('array')
					done()
				})
		})

		it('no deberia actualizar una marca con id invalido', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: []
			})

			brand.save()
				.then(brand => console.log())
				.catch(error => console.log('TEST:', error))

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

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
				suppliers: []
			})

			brand.save()
				.then(brand => console.log())
				.catch(error => console.log('TEST:', error))

			brand = new Brand({
				name: 'Exit cola',
				description: 'Bebida Gaseosa',
				suppliers: []
			})

			brand.save()
				.then(brand => console.log())
				.catch(error => console.log('TEST:', error))

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

			chai.request(server)
				.put('/brand/' + brand._id)
				.set('x-access-token', token)
				.send({
					name: 'Loca cola',
					description: 'Bebida Gaseosa',
					suppliers: []
				})
				.end((error, response) => {
					console.log('::RESPONSE-BODY::', response.body);
					response.should.have.status(422)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('La marca ya existe')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})
	})
	// DELETE /user/:userId - elimina un usuario por su id
	describe('DELETE /brand/:brandId', () => {
		it('deberia eliminar una marca por su id', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: []
			})

			brand.save()
				.then(brand => console.log())
				.catch(error => console.log('TEST:', error))

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

			chai.request(server)
				.delete('/brand/' + brand._id)
				.set('x-access-token', token)
				.end((error, response) => {
					response.should.have.status(200)
					response.body.should.be.a('object')
					response.body.should.have.property('message')
						.eql('Marca eliminada con exito')
					response.body.should.have.property('data').to.be.null
					done()
				})
		})

		it('no deberia eliminar una marca con id invalido', done => {
			let brand = new Brand({
				name: 'Loca cola',
				description: 'Bebida Gaseosa',
				suppliers: []
			})

			brand.save()
				.then(brand => console.log())
				.catch(error => console.log('TEST:', error))

			let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

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
	// POST /brand/:userId/supplier
	//   describe('POST /brand/:userId/supplier', () => {
	//     it('deberia agregar un proveedor a una marca', done => {
	//       let brand = new Brand({
	//         name: 'Loca cola',
	//         description: 'Bebida Gaseosa',
	//         supplier: []
	//       })

	//       brand.save()
	// 				.then(brand => console.log())
	// 				.catch(error => console.log('TEST:', error))

	// 			let user = {
	// 				username: 'admin@mail.com',
	// 				password: 'admin'
	// 			}

	// 			let token = jwt.sign(user, settings.secret, {
	// 				expiresIn: '8h'
	// 			})

	//       chai.request(server)
	//         .post('/brand/'+brand._id+'/supplier')
	//         .set('x-access-token', token)
	//         .send({ supplierId: supplier._id.toString()})
	//     })
	//   })
})
