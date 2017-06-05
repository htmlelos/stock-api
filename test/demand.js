'use strict';

process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
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
        Product.remove({}, error => {})
        Branch.remove({}, error => {})
        Person.remove({}, error => {})
        Demand.remove({}, error => { })        
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

        it.skip('deberia obtener la cantidad de solicitudes indicada', done => {})
        it.skip('deberia obtener los campos seleccionados de las solicitudes indicada', done => {})
        it.skip('deberia obtener las solicitudes indicada', done => {})
        it.skip('deberia obtener las solicitudes en el orden indicado', done => {})
    })

    describe('POST /demand', () => {
        it('deberia crear una solicitud', done => {
            let demand = {
                name: 'Solicitud' + new Date(Date.now()).toLocaleDateString(),
                startDate: new Date(Date.now()).toLocaleDateString(),
                items: []                
            }

            let product = new Product({
                name: 'Queso Keso',
                brand:null,
                category: null,
                code: '77913001400002',
                priceList: null,
                stauts: 'ACTIVO'
            })

            product.save()
                .catch(error => {console.log('TEST--', error)})

            let branch = new Branch({
                name: 'Lavalle',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => {console.log('TEST--', error)})

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
                .catch(error => {console.log('TEST--', error)})

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

        // it('no deberia crear una sucursal sin nombre', done => {
        //     let branch = {
        //         address: {
        //             province: 'San Luis',
        //             city: 'San Luis',
        //             street: 'Maipu'
        //         },
        //         status: 'ACTIVO'
        //     }

        //     chai.request(server)
        //         .post('/branch')
        //         .set('x-access-token', token)
        //         .send(branch)
        //         .end((error, response) => {
        //             response.should.be.status(422)
        //             response.body.should.be.a('object')
        //             response.body.should.have.property('message')
        //                 .eql('Debe proporcionar el nombre de la sucursal')
        //             response.body.should.have.property('data')
        //                 .to.be.null
        //             done()
        //         })
        // })

        // it('no deberia crear una sucursal sin estado', done => {
        //     let branch = {
        //         name: 'Lavalle 868',
        //         address: {
        //             province: 'San Luis',
        //             city: 'San Luis',
        //             street: 'Maipu'
        //         }
        //     }

        //     chai.request(server)
        //         .post('/branch')
        //         .set('x-access-token', token)
        //         .send(branch)
        //         .end((error, response) => {
        //             response.should.be.status(422)
        //             response.body.should.be.a('object')
        //             response.body.should.have.property('message')
        //                 .eql('Debe definir el estado de la sucursal')
        //             response.body.should.have.property('data')
        //                 .to.be.null
        //             done()
        //         })
        // })

        // it('el estado de la sucursal solo puede ser ACTIVO o INACTIVO', done => {
        //     let branch = {
        //         name: 'Lavalle 868',
        //         address: {
        //             province: 'San Luis',
        //             city: 'San Luis',
        //             street: 'Maipu'
        //         },
        //         status: 'SUSPENDIDO'
        //     }

        //     chai.request(server)
        //         .post('/branch')
        //         .set('x-access-token', token)
        //         .send(branch)
        //         .end((error, response) => {
        //             response.should.be.status(422)
        //             response.body.should.be.a('object')
        //             response.body.should.have.property('message')
        //                 .eql('El estado de la sucursal solo puede ser ACTIVO o INACTIVO')
        //             response.body.should.have.property('data')
        //                 .to.be.null
        //             done()
        //         })
        // })

        // it('no deberia crear una sucursal con nombre duplicado', done => {
        //     let branch = {
        //         name: 'Lavalle 868',
        //         address: {
        //             province: 'San Luis',
        //             city: 'San Luis',
        //             street: 'Maipu'
        //         },
        //         status: 'ACTIVO'
        //     }

        //     let newBranch = new Branch(branch)
        //     newBranch.save()
        //         .catch(error => console.error('TEST:', error))

        //     chai.request(server)
        //         .post('/branch')
        //         .set('x-access-token', token)
        //         .send(branch)
        //         .end((error, response) => {
        //             response.should.have.status(422)
        //             response.body.should.be.a('object')
        //             response.body.should.have.property('message')
        //                 .eql('La sucursal ya existe')
        //             response.body.should.have.property('data')
        //                 .to.be.null
        //             done()
        //         })
        // })
    })
})