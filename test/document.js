'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Business = require('../models/business')
const Person = require('../models/person')
const Product = require('../models/product')
const Category = require('../models/category')
const Document = require('../models/document')
const Counter = require('../models/counter')
const settings = require('../settings')
// Dependencias de desarrollo
const Factory = require('autofixture')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

describe('DOCUMENTS: test suite', () => {
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
        Business.remove({}, error => { })
        Person.remove({}, error => { })
        Product.remove({}, error => { })
        Category.remove({}, error => { })
        Document.remove({}, error => { })
        done()
    })
    // Obtener todos los documentos
    describe('GET /documents', () => {
        it('deberia obtener todos los documentos', done => {
            chai.request(server)
                .get('/documents')
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

        it('deberia obtener todos los documentos segun el criterio de busqueda', done => {
            let criteria = {
                limit: '',
                fields: '',
                filter: {},
                sort: {}
            }

            chai.request(server)
                .post('/documents')
                .send(criteria)
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

    describe('POST /document', () => {
        it('deberia crear un documento de tipo ORDEN de compra', done => {

            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST1: ', error) })

            let receiver = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            })
            receiver.save()
                .catch(error => { console.error('TEST2:', error) })
            let sender = new Person({
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                status: 'ACTIVO'
            })

            let category = new Category({
                name: 'Salame',
                description: 'Salame tipo milan',
                status: 'ACTIVO'
            })

            category.save()
                .catch(error => { console.log('TEST: ', error) })

            let product = new Product({
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => {
                    console.error('TEST: ', error)
                })

            let document = {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                documentNumber: 1,
                business: business._id,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }

            document.detail.push({
                product: product._id,
                quantity: 5,
                price: 50
            })

            chai.request(server)
                .post('/document')
                .send(document)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Documento creado con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('id')
                        .to.be.not.null;
                    done()
                })
        })

        it('no deberia crear un documento sin tipo de Documento', done => {
            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST1: ', error) })

            let receiver = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            })
            receiver.save()
                .catch(error => { console.error('TEST2:', error) })
            let sender = new Person({
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                status: 'ACTIVO'
            })

            let category = new Category({
                name: 'Salame',
                description: 'Salame tipo milan',
                status: 'ACTIVO'
            })

            category.save()
                .catch(error => { console.log('TEST: ', error) })

            let product = new Product({
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => {
                    console.error('TEST: ', error)
                })

            let document = {
                documentName: 'Orden de Compra',
                documentNumber: 1,
                business: business._id,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }

            document.detail.push({
                product: product._id,
                quantity: 5,
                price: 50
            })

            chai.request(server)
                .post('/document')
                .send(document)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe indicar el tipo de Documento')
                    response.body.should.have.property('data')
                        .to.be.null;
                    done()
                })
        })

        it('no deberia crear un documento sin nombre de documento', done => {
            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST1: ', error) })

            let receiver = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            })
            receiver.save()
                .catch(error => { console.error('TEST2:', error) })
            let sender = new Person({
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                status: 'ACTIVO'
            })

            let category = new Category({
                name: 'Salame',
                description: 'Salame tipo milan',
                status: 'ACTIVO'
            })

            category.save()
                .catch(error => { console.log('TEST: ', error) })

            let product = new Product({
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => {
                    console.error('TEST: ', error)
                })

            let document = {
                documentType: 'ORDEN',
                documentNumber: 1,
                business: business._id,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }

            document.detail.push({
                product: product._id,
                quantity: 5,
                price: 50
            })

            chai.request(server)
                .post('/document')
                .send(document)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe indicar el nombre del documento')
                    response.body.should.have.property('data')
                        .to.be.null;
                    done()
                })
        })

        it('no deberia crear un documento sin numero de documento', done => {

            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST1: ', error) })

            let receiver = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            })
            receiver.save()
                .catch(error => { console.error('TEST2:', error) })
            let sender = new Person({
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                status: 'ACTIVO'
            })

            let category = new Category({
                name: 'Salame',
                description: 'Salame tipo milan',
                status: 'ACTIVO'
            })

            category.save()
                .catch(error => { console.log('TEST: ', error) })

            let product = new Product({
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => {
                    console.error('TEST: ', error)
                })

            let document = {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                business: business._id,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }

            document.detail.push({
                product: product._id,
                quantity: 5,
                price: 50
            })

            chai.request(server)
                .post('/document')
                .send(document)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql(`Debe indicar el numero de ${document.documentType.toLowerCase()}`)
                    response.body.should.have.property('data')
                        .to.be.null;
                    done()
                })
        })

        it('no deberia crear un documento sin la empresa que crea el documento', done => {

            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST1: ', error) })

            let receiver = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            })
            receiver.save()
                .catch(error => { console.error('TEST2:', error) })
            let sender = new Person({
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                status: 'ACTIVO'
            })

            let category = new Category({
                name: 'Salame',
                description: 'Salame tipo milan',
                status: 'ACTIVO'
            })

            category.save()
                .catch(error => { console.log('TEST: ', error) })

            let product = new Product({
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => {
                    console.error('TEST: ', error)
                })

            let document = {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                documentNumber: 1,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }

            document.detail.push({
                product: product._id,
                quantity: 5,
                price: 50
            })

            chai.request(server)
                .post('/document')
                .send(document)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql(`Debe indicar la empresa que creó el documento`)
                    response.body.should.have.property('data')
                        .to.be.null;
                    done()
                })
        })

        it('no deberia crear un documento sin el destinatario del documento', done => {

            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST1: ', error) })

            let receiver = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            })
            receiver.save()
                .catch(error => { console.error('TEST2:', error) })
            let sender = new Person({
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                status: 'ACTIVO'
            })

            let category = new Category({
                name: 'Salame',
                description: 'Salame tipo milan',
                status: 'ACTIVO'
            })

            category.save()
                .catch(error => { console.log('TEST: ', error) })

            let product = new Product({
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => {
                    console.error('TEST: ', error)
                })

            let document = {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                documentNumber: 1,
                business: business._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }

            document.detail.push({
                product: product._id,
                quantity: 5,
                price: 50
            })

            chai.request(server)
                .post('/document')
                .send(document)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql(`Debe indicar el destinatario de ${document.documentType.toLowerCase()}`)
                    response.body.should.have.property('data')
                        .to.be.null;
                    done()
                })
        })

        it('no deberia crear un documento sin el destinatario del documento', done => {

            let business = new Business({
                name: 'Punta del Agua',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })
            business.save()
                .catch(error => { console.error('TEST1: ', error) })

            let receiver = new Person({
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            })
            receiver.save()
                .catch(error => { console.error('TEST2:', error) })
            let sender = new Person({
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                status: 'ACTIVO'
            })

            let category = new Category({
                name: 'Salame',
                description: 'Salame tipo milan',
                status: 'ACTIVO'
            })

            category.save()
                .catch(error => { console.log('TEST: ', error) })

            let product = new Product({
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => {
                    console.error('TEST: ', error)
                })

            let document = {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                documentNumber: 1,
                business: business._id,
                receiver: receiver.id,
                // sender: sender.id,                
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }

            document.detail.push({
                product: product._id,
                quantity: 5,
                price: 50
            })

            chai.request(server)
                .post('/document')
                .send(document)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql(`Debe indicar el emisor de ${document.documentType.toLowerCase()}`)
                    response.body.should.have.property('data')
                        .to.be.null;
                    done()
                })
        })
    })

    describe('GET /document/{documentId}', () => {
        let business = null
        let receiver = null
        let sender = null
        let category = null
        let product = null
        let document = null
        beforeEach(done => {
            Factory.define('Business', ['name', 'tributaryCode', 'status'])
            business = new Business(Factory.create('Business', { name: 'Punta del Agua', tributaryCode: '20086863813', status: 'ACTIVO' }))
            business.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Person', ['type', 'businessName', 'addresses', 'tributaryCode', 'grossIncommeCode', 'contacts', 'status'])
            receiver = new Person(Factory.create('Person', {
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            }))
            receiver.save()
                .catch(error => { console.error('Error: ', error) })
            sender = new Person(Factory.create('Person', {
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                contacts: [],
                status: 'ACTIVO'
            }))
            sender.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Category', ['name', 'description', 'status'])
            category = new Category(Factory.create('Category', { name: 'Salame', description: 'Salame tipo milan', status: 'ACTIVO' }))
            category.save()
                .catch(error => { console.log('TEST: ', error) })
            Factory.define('Product', ['name', 'marca', 'category', 'code', 'priceList', 'status'])
            product = new Product(Factory.create('Product', {
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            }))
            product.save()
                .catch(error => { console.error('TEST: ', error) })
            Factory.define('Document', ['documentType', 'documentName', 'documentNumber', 'business', 'receiver', 'sender', 'detail', 'subtotal', 'salesTaxes', 'total'])
            document = new Document(Factory.create('Document', {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                documentNumber: 1,
                business: business._id,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }))

            document.save()
                .catch(error => { console.error('TEST:', error) })
            done();
        })
        it('deberia obtener documento por su id', done => {
            chai.request(server)
                .get(`/document/${document._id}`)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Documento obtenido con éxito')
                    response.body.should.have.property('data')
                    done()
                })


        })
    })

    describe('PUT /document/update', () => {
        let business = null
        let receiver = null
        let sender = null
        let category = null
        let product = null
        let document = null
        beforeEach(done => {
            Factory.define('Business', ['name', 'tributaryCode', 'status'])
            business = new Business(Factory.create('Business', { name: 'Punta del Agua', tributaryCode: '20086863813', status: 'ACTIVO' }))
            business.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Person', ['type', 'businessName', 'addresses', 'tributaryCode', 'grossIncommeCode', 'contacts', 'status'])
            receiver = new Person(Factory.create('Person', {
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            }))
            receiver.save()
                .catch(error => { console.error('Error: ', error) })
            sender = new Person(Factory.create('Person', {
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                contacts: [],
                status: 'ACTIVO'
            }))
            sender.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Category', ['name', 'description', 'status'])
            category = new Category(Factory.create('Category', { name: 'Salame', description: 'Salame tipo milan', status: 'ACTIVO' }))
            category.save()
                .catch(error => { console.log('TEST: ', error) })
            Factory.define('Product', ['name', 'marca', 'category', 'code', 'priceList', 'status'])
            product = new Product(Factory.create('Product', {
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            }))
            product.save()
                .catch(error => { console.error('TEST: ', error) })
            Factory.define('Document', ['documentType', 'documentName', 'documentNumber', 'business', 'receiver', 'sender', 'detail', 'subtotal', 'salesTaxes', 'total'])
            document = new Document(Factory.create('Document', {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                documentNumber: 1,
                business: business._id,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }))

            document.save()
                .catch(error => { console.error('TEST:', error) })
            done();
        })

        it('deberia actualizar un documento de tipo ORDEN de compra', done => {
            chai.request(server)
                .put('/document/' + document._id)
                .send({
                    documentType: 'ORDEN',
                    documentName: 'Orden de Compra',
                    documentNumber: 2,
                    business: business._id,
                    receiver: receiver._id,
                    sender: sender.id,
                    detail: [],
                    subtotal: 70,
                    salesTaxes: .05,
                    total: 52.5
                })
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Documento actualizado con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('object')
                    done()
                })
        })

        it('No deberia actualizar un documento con id invalido', done => {
            chai.request(server)
                .put('/document/58dece08eb0548118ce31f11')
                .send({
                    documentType: 'ORDEN',
                    documentName: 'Orden de Compra',
                    documentNumber: 2,
                    business: business._id,
                    receiver: receiver._id,
                    sender: sender.id,
                    detail: [],
                    subtotal: 70,
                    salesTaxes: .05,
                    total: 52.5
                })
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el documento')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })

    describe('DELETE /document/{documentId}', () => {
        let business = null
        let receiver = null
        let sender = null
        let category = null
        let product = null
        let document = null
        beforeEach(done => {
            Factory.define('Business', ['name', 'tributaryCode', 'status'])
            business = new Business(Factory.create('Business', { name: 'Punta del Agua', tributaryCode: '20086863813', status: 'ACTIVO' }))
            business.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Person', ['type', 'businessName', 'addresses', 'tributaryCode', 'grossIncommeCode', 'contacts', 'status'])
            receiver = new Person(Factory.create('Person', {
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            }))
            receiver.save()
                .catch(error => { console.error('Error: ', error) })
            sender = new Person(Factory.create('Person', {
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                contacts: [],
                status: 'ACTIVO'
            }))
            sender.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Category', ['name', 'description', 'status'])
            category = new Category(Factory.create('Category', { name: 'Salame', description: 'Salame tipo milan', status: 'ACTIVO' }))
            category.save()
                .catch(error => { console.log('TEST: ', error) })
            Factory.define('Product', ['name', 'marca', 'category', 'code', 'priceList', 'status'])
            product = new Product(Factory.create('Product', {
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            }))
            product.save()
                .catch(error => { console.error('TEST: ', error) })
            Factory.define('Document', ['documentType', 'documentName', 'documentNumber', 'business', 'receiver', 'sender', 'detail', 'subtotal', 'salesTaxes', 'total'])
            document = new Document(Factory.create('Document', {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                documentNumber: 1,
                business: business._id,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }))

            document.save()
                .catch(error => { console.error('TEST:', error) })
            done();
        })
        it('deberia eliminar un documento por su id', done => {
            chai.request(server)
                .delete('/document/' + document._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Documento eliminado con éxito')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia eliminar un documento con id invalido', done => {
            chai.request(server)
                .delete('/document/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el documento')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })

    describe('POST /document/{documentId}/item', () => {
        let business = null
        let receiver = null
        let sender = null
        let category = null
        let product = null
        let document = null
        let counter = null
        beforeEach(done => {
            Factory.define('Business', ['name', 'tributaryCode', 'status'])
            business = new Business(Factory.create('Business', { name: 'Punta del Agua', tributaryCode: '20086863813', status: 'ACTIVO' }))
            business.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Person', ['type', 'businessName', 'addresses', 'tributaryCode', 'grossIncommeCode', 'contacts', 'status'])
            receiver = new Person(Factory.create('Person', {
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            }))
            receiver.save()
                .catch(error => { console.error('Error: ', error) })
            sender = new Person(Factory.create('Person', {
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                contacts: [],
                status: 'ACTIVO'
            }))
            sender.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Category', ['name', 'description', 'status'])
            category = new Category(Factory.create('Category', { name: 'Salame', description: 'Salame tipo milan', status: 'ACTIVO' }))
            category.save()
                .catch(error => { console.log('TEST: ', error) })
            Factory.define('Product', ['name', 'marca', 'category', 'code', 'priceList', 'status'])
            product = new Product(Factory.create('Product', {
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            }))
            product.save()
                .catch(error => { console.error('TEST: ', error) })
            Factory.define('Document', ['documentType', 'documentName', 'documentNumber', 'business', 'receiver', 'sender', 'detail', 'subtotal', 'salesTaxes', 'total'])
            document = new Document(Factory.create('Document', {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                business: business._id,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }))

            document.save()
                .catch(error => { console.error('TEST:', error) })
            done();
        })
        it('deberia agregar un item a un documento por su id', done => {
            let item = {
                product: product._id,
                quantity: 1,
                price: 20
            }

            chai.request(server)
                .post(`/document/${document._id}/item`)
                .send(item)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Item agregado con éxito')
                    response.body.should.have.property('data')
                    response.body.data.length.should.be.eql(1)
                    done()
                })
        })

        it('no deberia agregar un item a un documento con id invalido', done => {
            let item = {
                product: product._id,
                quantity: 1,
                price: 20
            }
            chai.request(server)
                .post(`/document/58dece08eb0548118ce31f11/item`)
                .send(item)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el documento')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia agregar un item que no es valido a un documento', done => {
            let item = {
                product: '58dece08eb0548118ce31f11',
                quantity: 1,
                price: 20
            }

            chai.request(server)
                .post(`/document/${document._id}/item`)
                .send(item)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el producto')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })

    describe('DELETE /document/{documentId}/item', () => {
        let business = null
        let receiver = null
        let sender = null
        let category = null
        let product = null
        let document = null
        beforeEach(done => {
            Factory.define('Business', ['name', 'tributaryCode', 'status'])
            business = new Business(Factory.create('Business', { name: 'Punta del Agua', tributaryCode: '20086863813', status: 'ACTIVO' }))
            business.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Person', ['type', 'businessName', 'addresses', 'tributaryCode', 'grossIncommeCode', 'contacts', 'status'])
            receiver = new Person(Factory.create('Person', {
                type: 'PROVEEDOR',
                businessName: 'Palladini',
                addresses: [{ address: 'San Martin 417, San Telmo, Buenos Aires' }],
                tributaryCode: 20232021692,
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncommeCode: 1220232021692,
                contacts: [{ phone: '154242707', name: 'Sergio Lucero' }],
                status: 'ACTIVO'
            }))
            receiver.save()
                .catch(error => { console.error('Error: ', error) })
            sender = new Person(Factory.create('Person', {
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                addresses: [{ address: 'Peatonal 6 Casa 226 Barrio Nuevo Rawson' }],
                tributaryCode: 20232021692,
                contacts: [],
                status: 'ACTIVO'
            }))
            sender.save()
                .catch(error => { console.error('Error: ', error) })
            Factory.define('Category', ['name', 'description', 'status'])
            category = new Category(Factory.create('Category', { name: 'Salame', description: 'Salame tipo milan', status: 'ACTIVO' }))
            category.save()
                .catch(error => { console.log('TEST: ', error) })
            Factory.define('Product', ['name', 'marca', 'category', 'code', 'priceList', 'status'])
            product = new Product(Factory.create('Product', {
                name: 'Salame',
                marca: 1,
                category: category._id,
                code: '779130014000',
                priceList: [],
                status: 'ACTIVO'
            }))
            product.save()
                .catch(error => { console.error('TEST: ', error) })
            Factory.define('Document', ['documentType', 'documentName', 'documentNumber', 'business', 'receiver', 'sender', 'detail', 'subtotal', 'salesTaxes', 'total'])
            document = new Document(Factory.create('Document', {
                documentType: 'ORDEN',
                documentName: 'Orden de Compra',
                documentNumber: 1,
                business: business._id,
                receiver: receiver._id,
                sender: sender.id,
                detail: [],
                subtotal: 50,
                salesTaxes: .05,
                total: 52.5
            }))

            document.save()
                .catch(error => { console.error('TEST:', error) })
            done();
        })

        it('deberia eliminar un item de un documento por su id', done => {
            let item = {
                product: product._id,
                quantity: 1,
                price: 20
            }

            document.detail.push(item)

            document.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .delete(`/document/${document._id}/item`)
                .send({ itemId: document.detail[0]._id })
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Item eliminado con exito')
                    response.body.should.have.property('data')
                    response.body.data.length.should.be.eql(0)
                    done()
                })
        })

        it('no deberia eliminar un item de un documento con id invalido', done => {
            let item = {
                product: product._id,
                quantity: 1,
                price: 20
            }

            document.detail.push(item)

            document.save()
                .catch(error => { console.error('TEST:', error) })

            chai.request(server)
                .delete(`/document/58dece08eb0548118ce31f11/item`)
                .send({ itemId: document.detail[0]._id })
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró el documento')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })
})