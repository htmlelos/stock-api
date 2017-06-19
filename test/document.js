'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Person = require('../models/person')
const Product = require('../models/product')
const Business = require('../models/business')
const Document = require('../models/document')
const settings = require('../settings')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

// Bloque principal de las pruebas de usuarios
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
        Business.remove({}, error => {})
        Product.remove({}, error=> {})
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
    })

    describe('POST /documents', () => {
        it('deberia obtener todos documentos segun el criterio indicado', done => {
            let criteria = {
                limit: '',
                fields: '',
                filter: {},
                sort: {}
            }

            chai.request(server)
                .post('/documents')
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
    })

    describe('/POST /document', () => {
        it('deberia crear una Orden de compra', done => {
            let business = new Business({
                name: 'Punta del agua',
                tributaryCode: '202320216922',
                status: 'ACTIVO'
            })

            business.save()
                .catch(error => { console.error('TEST:', error) })

            // let brand = new brand({
            //     name: 'Sancor',
            // })

            let product = new Product({
                name: 'Queso Cremoso',
                brand: null,
                category: null,
                code: '27955',
                ean13: '7791300279552',
                priceList: [],
                status: 'ACTIVO'
            })

            product.save()
                .catch(error => { code.error('TEST:', error) })

            let requester = new Person({
                type: 'ORDENANTE',
                firstName: 'Fernando',
                lastName: 'Lucero',
                bussinesName: null,
                addresses: [],
                tributaryCode: 20232021692,
                taxStatus: null,
                grossIncomeCode: null,
                status: 'ACTIVO'
            })             

            let document = {
                header: {
                    type: 'ORDEN',
                    status: 'ACTIVO',
                    documentNumber: '000001',
                    documentDate: Date.now(),
                    actors: [],
                    business: business._id
                },
                details: [{
                    product: product._id,
                    quantity: 5,
                    price: 50
                }],
                footer: {
                    subtotal: 50
                    , discounts: 0
                    , taxes: 0
                }
            }

            document.header.actors.push(requester._id)

            chai.request(server)
                .post('/document')
                .set('x-access-token', token)
                .send(document)
                .end((error, response) => {
                    console.log('RESPONSE::', response.body);
                    console.log('TEXT::', response.text);
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Documento creado con exito')
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('id')
                    done()
                })
        })
    })
})

