'use strict'
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
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
    let user = null;
    let token = '';

    beforeEach(done => {
        Product.remove({}, error => { })
        user = {
            username: 'admin@mail.com',
            password: 'admin'
        }
        token = jwt.sign(user, settings.secret, {
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
        it('deberia crear un nuevo producto', done => {
            let product = {
                name: 'Gaseosa 2L',
                brand: [],
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

        it('no deberia crear un nuevo producto sin nombre', done => {
            let product = {
                brand: [],
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

        it('no deberia crear un producto con un nombre duplicado', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: [],
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
                    brand: [],
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
        it('deberia obtener un producto por su id', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: '',
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .get('/product/' + product._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Producto obtenido con exito')
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('name')
                        .eql('Gaseosa 2L')
                    response.body.data.should.have.property('brand')
                        .eql('')
                    response.body.data.should.have.property('price')
                        .eql(35.5)
                    response.body.data.should.have.property('components')
                    response.body.data.components.should.be.a('array')
                    response.body.data.should.have.property('status')
                        .eql('ACTIVO')
                    done()
                })
        })

        it('no deberia obtener un producto con id invalido', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: '',
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
        it('deberia actualizar un producto por su id', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: '',
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
                    brand: 'Loca Cola',
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
                        .eql('Loca Cola')
                    response.body.data.should.have.property('price')
                        .eql(30.0)
                    response.body.data.should.have.property('components')
                    response.body.data.components.should.be.a('array')
                    response.body.data.should.have.property('status')
                        .eql('INACTIVO')
                    done()
                })
        })

        it('no deberia actualizar un producto con id invalido', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: '',
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

        it('no deberia actualizar un producto con nombre duplicado', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: '',
                price: 35.5,
                components: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            product = new Product({
                name: 'Gaseosa 1L',
                brand: '',
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
                    brand: '',
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
        it('deberia eliminar un producto por su id', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: '',
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

        it('no deberia eliminar un product con id invalido', done => {
            let product = new Product({
                name: 'Gaseosa 2L',
                brand: '',
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
})