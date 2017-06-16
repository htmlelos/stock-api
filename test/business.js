'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Business = require('../models/business')
const Branch = require('../models/branch')
const settings = require('../settings')
// dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

// Bloque principal de las pruebas de empresa
describe('BUSINESS', () => {
    let token = '';
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
    // Se ejectua despues de cada test
    afterEach(done => {
        Business.remove({}, error => { })
        Branch.remove({}, error => { })
        done()
    })
    // Obtener todos las empresas
    describe('GET /businesses', () => {
        it('deberia obtener todos las empresas', done => {
            chai.request(server)
                .get('/businesses')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
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
    // Obtener todas las empresas segun el criterio indicado
    describe('POST /businesses', () => {
        it('obtener las empresas segun los criterios indicados', done => {
            let criteria = {
                limit: '',
                fields: '',
                filter: {},
                sort: {}
            }

            chai.request(server)
                .post('/businesses')
                .set('x-access-token', token)
                .send(criteria)
                .end((error, response) => {
                    response.should.have.status(200)
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
    // Crear una nueva empresa
    describe('POST /business', () => {
        it('crea una nueva empresa', done => {
            let business = new Business({
                name: 'Water point',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })

            chai.request(server)
                .post('/business')
                .set('x-access-token', token)
                .send(business)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Empresa creada con éxito')
                    response.body.should.have.property('data')
                    response.body.should.should.be.a('object')
                    response.body.data.should.have.property('id')
                        .to.be.not.null
                    done()
                })
        })

        it('no deberia crear una empresa sin nombre', done => {
            let business = new Business({
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })

            chai.request(server)
                .post('/business')
                .set('x-access-token', token)
                .send(business)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe proporcionar el nombre de la empresa')
                    response.body.should.have.property('data')
                        .eql(null)
                    done()
                })
        })

        it('no deberia crear una empresa sin numero de cuit', done => {
            let business = new Business({
                name: 'Water point',
                status: 'ACTIVO'
            })

            chai.request(server)
                .post('/business')
                .set('x-access-token', token)
                .send(business)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El CUIT no es válido')
                    response.body.should.have.property('data')
                        .eql(null)
                    done()
                })
        })

        it('no deberia crear una empresa con un numero de cuit invalido', done => {
            let business = new Business({
                name: 'Water point',
                tributaryCode: '302232344567',
                status: 'ACTIVO'
            })

            chai.request(server)
                .post('/business')
                .set('x-access-token', token)
                .send(business)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El CUIT no es válido')
                    response.body.should.have.property('data')
                        .eql(null)
                    done()
                })
        })

        it('no deberia crear una empresa sin estado', done => {
            let business = new Business({
                name: 'Water point',
                tributaryCode: '20232021692'
            })

            chai.request(server)
                .post('/business')
                .set('x-access-token', token)
                .send(business)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El estado de la empresa es inválido')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('el estado de la empresa deberia ser ACTIVO o INACTIVO', done => {
            let business = new Business({
                name: 'Water point',
                tributaryCode: '20232021692',
                status: 'HABILITADO'
            })

            chai.request(server)
                .post('/business')
                .set('x-access-token', token)
                .send(business)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El estado de la empresa es inválido')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia crear una empresa con nombre duplicado', done => {
            let business = {
                name: 'Water point',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            }

            let newBusiness = new Business(business)
            newBusiness.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .post('/business')
                .set('x-access-token', token)
                .send(business)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('La empresa ya existe')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

    })
    // Obtener la empresa segun su id
    describe('GET /business/{businessId}', () => {
        it('deberia obtener una empresa por su id', done => {
            let business = new Business({
                name: 'Water point',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })

            business.save()
                .catch(error => { console.error('Error: ', error) })

            chai.request(server)
                .get('/business/' + business._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Empresa obtenida con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('name')
                    response.body.data.should.have.property('tributaryCode')
                    response.body.data.should.have.property('status')
                    done()
                })
        })

        it('no deberia obtener una empresa con un id inválido', done => {
            let business = new Business({
                name: 'Water point',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })

            business.save()
                .catch(error => { console.error('Error: ', error) })

            chai.request(server)
                .get('/business/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la empresa')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })
    // Actualizar una empresa segun su id
    describe('PUT /business/{businessId}', () => {
        it('deberia actualizar una empresa por su id', done => {
            let business = new Business({
                name: 'Water Point',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })

            business.save()
                .catch(error => console.error('TEST', error))

            chai.request(server)
                .put('/business/' + business._id)
                .set('x-access-token', token)
                .send({
                    status: 'INACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Empresa actualizada con éxito')
                    done()
                })
        })

        it('no deberia actualizar una empresa con id inválido', done => {
            let business = new Business({
                name: 'Water Point',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })

            business.save()
                .catch(error => console.error('TEST', error))

            chai.request(server)
                .put('/business/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .send({
                    status: 'INACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la empresa')
                    done()
                })
        })
    })
    // Eliminar una empresa segun su id
    describe('DELETE /business/{businessId}', () => {
        it('deberia eliminar una empresa por su id', done => {
            let business = new Business({
                name: 'Water point',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })

            business.save()
                .catch(error => console.error('TEST: ', error))

            chai.request(server)
                .delete('/business/' + business._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Empresa eliminada con éxito')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia eliminar una empresa con id inválido', done => {
            let business = new Business({
                name: 'Water point',
                tributaryCode: '20232021692',
                status: 'ACTIVO'
            })

            business.save()
                .catch(error => console.error('TEST: ', error))

            chai.request(server)
                .delete('/business/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la empresa')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })
})