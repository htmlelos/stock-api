'use strict'
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Brand = require('../models/brand')
const Supplier = require('../models/supplier')
const Product = require('../models/product')
const settings = require('../settings.cfg')
// Depensencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

// Bloque principal de las pruebas de usuarios
describe('PRODUCTS test suite', () => {
    let mockUser = null
    let token = ''

    beforeEach(done => {
        Brand.remove({}, error => {})
        Supplier.remove({}, error => {})
        Product.remove({}, error => {})
        mockUser = {
            username: 'admin@mail.com',
            password: 'admin'
        }
        token = jwt.sign(mockUser, settings.secret, {
            expiresIn: '8h'
        })
        done()
    })
    // Obtener /products - Obtener todos los products
    describe('GET /products', () => {
        it('deberia obtener todos los productos', done => {

            chai.request(server)
                .get('/products')
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
    // POST /product - Crea un producto
    describe('POST /products', () => {
        // Deberia crear un nuevo producto
        it('deberia crear un nuevo producto', done => {
            let product = {
                name: 'Gaseosa 2L',
                brand: null,
                price: 35,
                components: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/product')
                .send(product)
                .set('x-access-token', token)
                .end((error, response) => {            
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message').eql('Producto creado con exito')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        // No deberia crear un nuevo producto sin nombre
        it('no deberia crear un nuevo producto sin nombre', done => {
            let product = {
                brand: null,
                price: 35,
                components: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/product')
                .send(product)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message').eql('Debe proporcionar un nombre de producto')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        // No deberia crear un producto con un nombre duplicado
        it('no deberia crear un producto con un nombre duplicado', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: null,
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .post('/product')
                .set('x-access-token', token)
                .send({
                    name: 'Gaseosa 2L',
                    brand: null,
                    price: 35.5,
                    components: [],
                    status: 'ACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El producto ya existe')
                    response.body.should.have.property('data').to.be.null
                    done();
                })
        })
    })
    // GET /product/:productId - Obtener un producto por su id
    describe('GET /products/:productId', () => {
        // Deberia obtener un producto por su id
        it('deberia obtener un producto por su id', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: null,
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            let brand = new Brand({
                name: 'Loca Cola',
                description: 'Bebidas Gaseosas',
                supplier: []
            })

            let supplier = new Supplier({
                name: 'Distribuidora Herrero S.A.',
                addresses: [],
                contacts: [],
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => {console.log('TEST: ', error)})

            brand.suppliers.push(supplier)

            brand.save()
                .catch(error => {console.log('TEST: ', error)})                

            product.brand = brand

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .get('/product/' + product._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    console.log('::RESPONSE-BODY::', response.body);
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Producto obtenido con exito')
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('name')
                        .eql('Gaseosa 2L')
                    response.body.data.should.have.property('brand')
                    response.body.data.brand.should.be.a('object')
                    response.body.data.brand.should.have.property('name')
                        .eql('Loca Cola')
                    response.body.data.brand.should.have.property('description')
                        .eql('Bebidas Gaseosas')
                    response.body.data.brand.should.have.property('suppliers')
                    response.body.data.brand.suppliers.should.be.a('array')                        
                    response.body.data.should.have.property('price')
                        .eql(35.5)
                    response.body.data.should.have.property('components')
                    response.body.data.components.should.be.a('array')
                    response.body.data.should.have.property('status')
                        .eql('ACTIVO')
                    done()
                })
        })
        // No deberia obtener un producto con id invalido
        it('no deberia obtener un producto con id invalido', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: null,
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .get('/product/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el producto')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // PUT /product/:productId - Actualizar un producto por su id
    describe('PUT /product/:productId', () => {
        // Deberia actualizar un producto por su id
        it('deberia actualizar un producto por su id', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: null,
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .put('/product/' + product._id)
                .set('x-access-token', token)
                .send({
                    name: 'Gaseosa 1L',
                    brand: mongoose.Types.ObjectId('583f4b76fe38ab1154786e84'),
                    price: 30.0,
                    components: [],
                    status: 'INACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Producto actualizado con exito')
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('name')
                        .eql('Gaseosa 1L')
                    response.body.data.should.have.property('brand')
                        .eql('583f4b76fe38ab1154786e84')
                    response.body.data.should.have.property('price')
                        .eql(30.0)
                    response.body.data.should.have.property('components')
                    response.body.data.components.should.be.a('array')
                    response.body.data.should.have.property('status')
                        .eql('INACTIVO')
                    done()
                })
        })
        // No deberia actualizar un producto con id invalido
        it('no deberia actualizar un producto con id invalido', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: null,
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .put('/product/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .send({
                    name: 'Gaseosa 1L',
                    brand: 'Loca Cola',
                    price: 30.0,
                    components: [],
                    status: 'INACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El producto, no es un producto valido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        // No deberia actualiza un producto con nombre duplicado
        it('no deberia actualizar un producto con nombre duplicado', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: null,
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            product = new Product({
                name: 'Gaseosa 1L',
                brand: null,
                price: 30.5,
                components: [],
                status: 'INACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .put('/product/' + product._id)
                .set('x-access-token', token)
                .send({
                    name: 'Gaseosa 2L',
                    brand: null,
                    price: 30.5,
                    components: [],
                    status: 'INACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El producto ya existe')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // DELETE /product/:productId - Elimina un producto por su id
    describe('DELETE /product/:productId', () => {
        // Deberia eliminar un producto por su id
        it('deberia eliminar un producto por su id', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: null,
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .delete('/product/' + product._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Producto eliminado con exito')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        // No deberia eliminar un producto con id invalido
        it('no deberia eliminar un product con id invalido', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: null,
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .delete('/product/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El producto, no es un producto valido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // GET /product/:productId/brand
    describe('GET /product/:productId/brand', () => {
        it('deberia obtener la marca para un producto', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: null,
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            let brand = new Brand({
                name: 'Loca Cola',
                description: 'Bebidas Gaseosas',
                supplier: []
            })
            
            brand.save()
                .catch(error => {console.log('TEST: ', error)})

            product.brand = brand

            product.save()
                .catch(error => { console.log('TEST: ', error) })                        

            chai.request(server)
                .get('/product/'+product._id+'/brand')
                .set('x-access-token', token)                
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Marca obtenida con exito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('object')
                    response.body.data.should.have.property('name')
                        .eql('Loca Cola')
                    response.body.data.should.have.property('description')
                        .eql('Bebidas Gaseosas')
                    response.body.data.should.have.property('suppliers')
                    response.body.data.suppliers.should.be.a('array')
                    response.body.data.suppliers.length.should.be.eql(0)
                    done()
                })
        })
    })
})