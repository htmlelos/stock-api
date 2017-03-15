'use strict'
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Brand = require('../models/brand')
const Person = require('../models/person')
const Product = require('../models/product')
const PriceList = require('../models/priceList')
const settings = require('../settings.cfg')
// Depensencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

// Bloque principal de las pruebas de usuarios
describe('PRODUCTS: ', () => {
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
                done()
            })
    })
    afterEach(done => {
        Brand.remove({}, error => { })
        Person.remove({}, error => { })
        Product.remove({}, error => { })
        PriceList.remove({}, error => { })
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
                    response.body.data.should.be.a('array')
                    response.body.data.length.should.be.eql(0)
                    done()
                })
        })
    })
    // POST /product - Crea un producto
    describe('POST /product', () => {
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
                    response.body.should.have.property('message')
                        .eql('Producto creado con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('id').to.be.not.null
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
                    response.body.should.have.property('message')
                        .eql('El nombre del producto esta vacio')
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
    describe('GET /products/{productId}', () => {
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
                supplier: [],
                status: 'ACTIVO'
            })

            let supplier = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                addresses: [],
                contacts: [],
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST: ', error) })

            brand.suppliers.push(supplier)

            brand.save()
                .catch(error => { console.log('TEST: ', error) })

            product.brand = brand

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .get('/product/' + product._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    // console.log('RESPONSE::', response.body)
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Producto obtenido con éxito')
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
                    // response.body.data.should.have.property('price')
                    //     .eql(35.5)
                    response.body.data.should.have.property('components')
                    response.body.data.components.should.be.a('array')
                    response.body.data.should.have.property('status')
                        .eql('ACTIVO')
                    done()
                })
        })
        // No deberia obtener un producto con id inválido
        it('no deberia obtener un producto con id inválido', done => {
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
    describe('PUT /product/{productId}', () => {
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

            let brand = new Brand({
                name: 'Loca Cola',
                description: 'Bebida Gaseosa',
                status: 'ACTIVO'
            })

            brand.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .put('/product/' + product._id)
                .set('x-access-token', token)
                .send({
                    name: 'Gaseosa 1L',
                    brand: brand._id,
                    price: 30.0,
                    components: [],
                    status: 'INACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Producto actualizado con éxito')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        // No deberia actualizar un producto con id inválido
        it('no deberia actualizar un producto con id inválido', done => {
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
                        .eql('No se encontró el producto')
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
    describe('DELETE /product/{productId}', () => {
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
                        .eql('Producto eliminado con éxito')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        // No deberia eliminar un producto con id inválido
        it('no deberia eliminar un product con id inválido', done => {
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
                        .eql('No se encontró el producto')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // GET /product/:productId/brand
    describe('GET /product/{productId}/brand', () => {
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
                supplier: [],
                status: 'ACTIVO'
            })

            brand.save()
                .catch(error => { console.log('TEST: ', error) })

            product.brand = brand

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .get('/product/' + product._id + '/brand')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Marca obtenida con éxito')
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
    // GET /product/:productId/priceLists
    describe('GET /product/{productId}/priceLists', () => {
        it('deberia obtener todos las listas de precios del producto', done => {
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
                supplier: [],
                status: 'ACTIVO'
            })

            brand.save()
                .catch(error => { console.log('TEST: ', error) })

            product.brand = brand

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .get('/product/' + product._id + '/pricelists')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Listas de Precios obtenidas con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    response.body.data.length.should.be.eql(0)
                    done()
                })
        })

        it('no deberia obtener listas de precios de productos con id inválido', done => {
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
                supplier: [],
                status: 'ACTIVO'
            })

            brand.save()
                .catch(error => { console.log('TEST: ', error) })

            product.brand = brand

            product.save()
                .catch(error => { console.log('TEST: ', error) })

            chai.request(server)
                .get('/product/58dece08eb0548118ce31f11/pricelists')
                .set('x-access-token', token)
                .end((error, response) => {
                    // El test inicia aqui
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el producto')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // POST /product/:productId/priceList
    describe('POST /product/{productId}/priceList', () => {
        it('deberia agregar un precio con su lista a un producto', done => {
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
                supplier: [],
                status: 'ACTIVO'
            })

            brand.save()
                .catch(error => { console.log('TEST1: ', error) })

            product.brand = brand

            let priceList = new PriceList({
                name: 'Precios al por Menor',
                description: 'Lista de Precios para compradores al por Menor',
                status: 'ACTIVO'
            })

            priceList.save()
                .catch(error => { console.log('TEST2: ', error) })


            let price = {
                priceListId: priceList._id,
                cost: 30,
                profit: 0.3,
                status: 'ACTIVO'
            }

            product.save()
                .catch(error => { console.log('TEST3: ', error) })

            chai.request(server)
                .post('/product/' + product._id + '/pricelist')
                .set('x-access-token', token)
                .send(price)
                .end((error, response) => {
                    // El test inicia aqui
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Precio añadido con éxito')
                    response.body.should.have.property('data').to.be.not.null
                    done()
                })
        })

        it('no deberia agregar un precio si el id de producto no es válido', done => {
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
                supplier: [],
                status: 'ACTIVO'
            })


            brand.save()
                .catch(error => { console.log('TEST1: ', error) })

            product.brand = brand

            let priceList = new PriceList({
                name: 'Precios al por Menor',
                description: 'Lista de Precios para compradores al por Menor',
                status: 'ACTIVO'
            })

            priceList.save()
                .catch(error => { console.log('TEST2: ', error) })

            let price = {
                priceListId: priceList._id,
                cost: 30,
                profit: 0.3,
                status: 'ACTIVO'
            }

            product.save()
                .catch(error => { console.log('TEST3: ', error) })

            chai.request(server)
                .post('/product/58dece08eb0548118ce31f11/pricelist')
                .set('x-access-token', token)
                .send(price)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el producto')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })

        it('No deberia agregar una lista de precio con id inválido', done => {
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
                supplier: [],
                status: 'ACTIVO'
            })


            brand.save()
                .catch(error => { console.log('TEST1: ', error) })

            product.brand = brand

            let priceList = new PriceList({
                name: 'Precios al por Menor',
                description: 'Lista de Precios para compradores al por Menor',
                status: 'ACTIVO'
            })

            priceList.save()
                .catch(error => { console.log('TEST2: ', error) })


            let price = {
                priceListId: '58dece08eb0548118ce31f11',
                cost: 30,
                profit: 0.3,
                status: 'ACTIVO'
            }

            product.save()
                .catch(error => { console.log('TEST3: ', error) })

            chai.request(server)
                .post('/product/' + product._id + '/pricelist')
                .set('x-access-token', token)
                .send(price)
                .end((error, response) => {
                    // El test inicia aqui
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la lista de precios')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // POST /product/:productId/component
    describe('POST /product/{productId}/component', () => {
        it('deberia agregar un componente a un producto', done => {
            let productComponent = new Product({
                name: 'Maple Huevos Marrones',
                brand: null,
                price: 50.00,
                components: [],
                status: 'ACTIVO'
            })

            productComponent.save()
                .catch(error => { console.error('ERROR', error) })

            let productBase = new Product({
                name: 'Huevo Marron',
                brand: null,
                price: 2.00,
                components: [],
                status: 'ACTIVO'
            })

            productBase.save()
                .catch(error => { console.error('ERROR', error) })

            let component = {
                quantity: 30,
                unit: 'Unidad',
                componentId: productComponent._id
            }

            chai.request(server)
                .post('/product/' + productBase._id + '/component')
                .set('x-access-token', token)
                .send(component)
                .end((error, response) => {
                    // console.log('RESPONSE::', response.body);
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Componente agregado con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    done()
                })
        })

        it('no deberia agregar un componente a un producto invalido', done => {
            let productComponent = new Product({
                name: 'Maple Huevos Marrones',
                brand: null,
                price: 50.00,
                components: [],
                status: 'ACTIVO'
            })

            productComponent.save()
                .catch(error => { console.error('ERROR', error) })

            let productBase = new Product({
                name: 'Huevo Marron',
                brand: null,
                price: 2.00,
                components: [],
                status: 'ACTIVO'
            })

            productBase.save()
                .catch(error => { console.error('ERROR', error) })

            let component = {
                quantity: 30,
                unit: 'Unidad',
                componentId: productComponent._id
            }

            chai.request(server)
                .post('/product/58dece08eb0548118ce31f11/component')
                .set('x-access-token', token)
                .send(component)
                .end((error, response) => {
                    // console.log('RESPONSE::', response.body);
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el producto')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })

        it('no deberia agregar un componente que no existe a un producto', done => {
            let productComponent = new Product({
                name: 'Maple Huevos Marrones',
                brand: null,
                price: 50.00,
                components: [],
                status: 'ACTIVO'
            })

            productComponent.save()
                .catch(error => { console.error('ERROR', error) })

            let productBase = new Product({
                name: 'Huevo Marron',
                brand: null,
                price: 2.00,
                components: [],
                status: 'ACTIVO'
            })

            productBase.save()
                .catch(error => { console.error('ERROR', error) })

            let component = {
                quantity: 30,
                unit: 'Unidad',
                componentId: mongoose.Types.ObjectId('58dece08eb0548118ce31f11')
            }

            chai.request(server)
                .post('/product/' + productBase._id + '/component')
                .set('x-access-token', token)
                .send(component)
                .end((error, response) => {
                    // console.log('RESPONSE::', response.body);
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el componente')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // DELETE /product/:productId/components
    describe('DELETE /product/{productId}/components', () => {
        it.only('deberia eliminar los compoentente indicados de un producto ', done => {
            let productBase = new Product({
                name: 'Maple Huevos Marrones',
                brand: null,
                price: 50.00,
                components: [],
                status: 'ACTIVO'
            })

            let components = []

            let productComponent = new Product({
                name: 'Huevo Marron',
                brand: null,
                price: 2.00,
                components: [],
                status: 'ACTIVO'
            })

            productComponent.save()
                .catch(error => { console.error('ERROR', error) })

            let component = {
                quantity: 30,
                unit: 'Unidad',
                componentId: productComponent._id
            }
            components.push(productComponent._id)
            productBase.components.push(component)


            productComponent = new Product({
                name: 'Huevo Blanco',
                brand: null,
                price: 2.50,
                components: [],
                status: 'ACTIVO'
            })

            productComponent.save()
                .catch(error => { console.error('ERROR', error) })

            component = {
                quantity: 30,
                unit: 'Unidad',
                componentId: productComponent._id
            }
            // components.push(productComponent._id)
            productBase.components.push(component)
            
            productBase.save()
                .catch(error => { console.error('ERROR', error) })

            chai.request(server)
                .delete('/product/'+productBase._id+'/components')
                .set('x-access-token', token)
                .send({components:JSON.stringify(components)})
                .end((error, response) =>{
                    console.log('RESPONSE::', response.body);
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.be.property('message')
                        .eql('Componentes eliminados con éxito')
                    response.body.should.be.property('data')
                    response.body.data.should.be.a('array')
                    done()  
                })
        })
    })
})