'use strict';

process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Business = require('../models/business')
const Product = require('../models/product')
const Branch = require('../models/branch')
const Person = require('../models/person')
const Demand = require('../models/demand')
const settings = require('../settings')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

describe('DEMAND: ', () => {
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
                response.body.should.be.a('object')
                response.body.should.have.property('data')
                response.body.data.should.have.property('token')
                token = response.body.data.token
                done()
            })
    })

    afterEach(done => {
        Product.remove({}, error => { })
        Branch.remove({}, error => { })
        Person.remove({}, error => { })
        Demand.remove({}, error => { })
        Business.remove({}, error => { })
        done()
    })

    describe('GET /demands', () => {
        it('deberia obtener todas las solicitudes', done => {
            chai.request(server)
                .get('/demands')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    response.body.data.length.should.be.eql(0)
                    done()
                })
        })
    })

    describe('POST /demands', () => {
        it('deberia obtener todas las solicitudes segun el criterio indicado', done => {
            let criteria = {
                limit: '',
                fields: '',
                filter: {},
                sort: {}
            }

            chai.request(server)
                .post('/demands')
                .set('x-access-token', token)
                .send(criteria)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('')
                    done()
                })
        })

        it.skip('deberia obtener la cantidad de solicitudes indicada', done => { })
        it.skip('deberia obtener los campos seleccionados de las solicitudes indicada', done => { })
        it.skip('deberia obtener las solicitudes indicada', done => { })
        it.skip('deberia obtener las solicitudes en el orden indicado', done => { })
    })

    describe('POST /demand', () => {
        it('deberia crear una solicitud', done => {
            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST', error) })

            let demand = {
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: [],
                business: business._id
            }

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            chai.request(server)
                .post('/demand')
                .set('x-access-token', token)
                .send(demand)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Solicitud creada con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('object')
                    response.body.data.should.have.property('id')
                        .to.be.not.null
                    done()
                })
        })

        it('no deberia crear una solicitud sin nombre', done => {
            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST', error) })

            let demand = {
                startDate: new Date(Date.now()).toLocaleDateString(),
                items: [],
                business: business._id
            }

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            chai.request(server)
                .post('/demand')
                .set('x-access-token', token)
                .send(demand)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe proporcionar un nombre de solicitud de compra')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia crear una solicitud sin fecha de pedido', done => {
            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST', error) })      

            let demand = {
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString()}`,
                items: [],
                business: business._id
            }

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            chai.request(server)
                .post('/demand')
                .set('x-access-token', token)
                .send(demand)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe proporcionar una fecha inicial del pedido')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })

    describe('GET /demand/{demandId}', () => {
        it('deberia obtener un pedido por su id', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            demand.save()
                .catch(error => { console.error('TEST:', error) })


            chai.request(server)
                .get(`/demand/${demand._id}`)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Solicitud obtenida con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('name')
                    response.body.data.should.have.property('startDate')
                    response.body.data.should.have.property('items')
                    done()
                })
        })

        it('no deberia obtener un pedido con id inválido', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            demand.save()
                .catch(error => { console.error('TEST:', error) })


            chai.request(server)
                .get(`/demand/58dece08eb0548118ce31f11`)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la solicitud')
                    response.body.should.have.property('data')
                        .to.be.null
                    done();
                })
        })
    })

    describe('PUT /demand/{demandId}', () => {
        it('deberia actualizar una solicitud por su id', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/' + demand._id)
                .set('x-access-token', token)
                .send({
                    name: 'New Name'
                })
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Solicitud actualizada con éxito')
                    done()
                })
        })

        it('no deberia actualizar una empresa con id invalido', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .send({
                    name: 'New Name'
                })
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la solicitud')
                    done()
                })
        })
    })

    describe('DELETE /demand/{demandId}', () => {
        it('deberia eliminar una solicitud por su id', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .delete('/demand/' + demand._id)
                .set('x-access-token', token)
                .send({
                    name: 'New Name'
                })
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Solicitud eliminada con éxito')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia eliminar un solicitud con id inválido', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .delete('/demand/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .send({
                    name: 'New Name'
                })
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la solicitud')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })

    describe('PUT /demand/{demandId}/add/item', () => {
        it('deberia agregar un itema a la solicitud de pedido', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/' + demand._id + '/add/item')
                .set('x-access-token', token)
                .send(item)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Item agregado con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    done()
                })
        })

        it('no deberia agregar un item a la solicitud de pedido sin proveedor', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: null
            }

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/' + demand._id + '/add/item')
                .set('x-access-token', token)
                .send(item)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe seleccionar el proveedor del producto')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia agregar un item a la solicitud de pedido sin sucursalr', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: null,
                supplier: supplier._id
            }

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/' + demand._id + '/add/item')
                .set('x-access-token', token)
                .send(item)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe ingresar la sucursal que solicito el producto')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia agregar un item a la solicitud de pedido sin producto', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: null,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/' + demand._id + '/add/item')
                .set('x-access-token', token)
                .send(item)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe ingresar el producto solicitado')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia agregar un item a la solicitud de pedido sin la cantidad solicitada', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: null,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/' + demand._id + '/add/item')
                .set('x-access-token', token)
                .send(item)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe ingresar la cantidad solicitada')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia agregar un item a la solicitud de pedido sin la fecha de solicitud', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: null,
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/' + demand._id + '/add/item')
                .set('x-access-token', token)
                .send(item)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe ingresar la fecha de solicitud')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })

    describe('DELETE /demand/{demandId}/delete/item', () => {
        it('deberia agregar un itema a la solicitud de pedido', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            // console.log('DEMAND::', demand);

            chai.request(server)
                .put('/demand/' + demand._id + '/delete/item')
                .set('x-access-token', token)
                .send({ demandId: demand._id })
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Item eliminado con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    done()
                })
        })

        it('no deberia eliminar un itema de la solicitud de pedido con id de solicitud inválido', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/58dece08eb0548118ce31f11/delete/item')
                .set('x-access-token', token)
                .send({ demandId: demand._id })
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la solicitud')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })

    describe('DELETE /demand({demandId}/delete/items', () => {
        it('deberia eliminar los items seleccionados', done => {
            let demand = new Demand({
                name: `Solicitud ${new Date(Date.now()).toLocaleDateString('es-AR', { timeZone: "UTC" })}`,
                startDate: Date.now(),
                items: []
            })

            let product = new Product({
                name: 'Queso Keso',
                brand: null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => { console.log('TEST--', error) })

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => { console.log('TEST--', error) })

            let supplier = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladinni',
                addresses: null,
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            supplier.save()
                .catch(error => { console.log('TEST--', error) })

            let itemslist = []

            let item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 5,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)
            itemslist.push(demand.items[0]._id)

            item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 3,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)

            item = {
                dateDemand: new Date(Date.now()).toLocaleDateString(),
                quantity: 1,
                product: product._id,
                branch: branch._id,
                supplier: supplier._id
            }

            demand.items.push(item)
            itemslist.push(demand.items[2]._id)

            demand.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .put('/demand/' + demand._id + '/delete/items')
                .set('x-access-token', token)
                .send(itemslist)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Items seleccionados eliminados con éxito')
                    response.body.should.have.property('data')
                    done()
                })
        })
    })

    describe('POST /demand/generate', () => {
        it('deberia generar ordenes de compra', done => {
            
        })
    })
})