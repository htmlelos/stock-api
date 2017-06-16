'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
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
})

