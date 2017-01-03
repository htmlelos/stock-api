'use strict';
// Esablecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Person = require('../models/person')
const settings = require('../settings.cfg')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

// Bloque principal de las pruebas de usuarios
describe.only('PERSON: test suite', () => {
    let token = ''
    // Se ejecuta antes de cada test
    beforeEach(done => {
        done()
    })
    // Se ejecuta despues de cada test
    afterEach(done => {
        Person.remove({}, error => { })
        done()
    })
    // GET /persons - Obtener todas las personas
    describe('GET /persons', () => {
        it('deberia obtener todas las personas', done => {
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
                    let person = {
                        type: 'CLIENTE',
                        firstName: 'Juan',
                        lastName: 'Perez',
                        address: [],
                        tributaryCode: '202202231962',
                        taxStatus: 'RESPONSABLE INSCRIPTO',
                        grossIncomeCode: '122022022319623',
                        contacts: [],
                        status: 'ACTIVO'
                    }

                    chai.request(server)
                        .get('/persons')
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
    })
    // POST /person - Crea una persona
    describe('POST /person', () => {
        it.only('deberia crear una nueva persona', () => {
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
                    let person = {
                        type: 'CLIENTE',
                        firstName: 'Juan',
                        lastName: 'Perez',
                        address: [],
                        tributaryCode: '202202231962',
                        taxStatus: 'RESPONSABLE INSCRIPTO',
                        grossIncomeCode: '122022022319623',
                        contacts: [],
                        status: 'ACTIVO'
                    }

                    chai.request(server)
                        .post('/person')
                        .set('x-access-token', token)
                        .send(person)
                        .end((error, response) => {
                            console.log('RESPONSE_BODY', response.body);
                            response.body.should.be.status(200)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message').eql(`${person.type} creado con exito`)
                            response.body.should.have.property('data')
                            response.body.data.should.have.property('id').to.be.not.null
                            done()
                        })
                })
        })

        it('no deberia crear una nueva persona sin tipo de persona', () => {
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
                    let person = {
                        firstName: 'Juan',
                        lastName: 'Perez',
                        address: [],
                        tributaryCode: '202202231962',
                        taxStatus: 'RESPONSABLE INSCRIPTO',
                        grossIncomeCode: '122022022319623',
                        contacts: [],
                        status: 'ACTIVO'
                    }

                    chai.request(server)
                        .post('/person')
                        .set('x-access-token', token)
                        .send(person)
                        .end((error, response) => {
                            
                            response.body.should.be.status(200)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('Debe proporcionar un tipo de persona')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
})