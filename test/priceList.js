'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const PriceList = require('../models/priceList')
const settings = require('../settings.cfg')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)
// Bloque principal de pruebas de roles
describe.only('PRICE LIST: test suite', () => {
  let token = ''
  // Se ejecuta previo a cada test
  beforeEach(done => {
    done()
  })
  // Se ejecuta despues de cada test
  afterEach(done => {
    PriceList.remove({}, error => { })
    done()
  })

  // GET /pricelist - Obtener todas las listas de precio
  describe('GET /pricelists', () => {
    it('deberia obtener todas las listas de precio', done => {
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

          chai.request(server)
            .get('/pricelists')
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
  // POST /pricelist - crea una nueva lista de precios
  describe('POST /pricelist', () => {
    it('deberia crear una nueva lista de precios', done => {
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
          let priceList = {
            name: 'Precios con IVA',
            description: 'Lista de precios de cliente inscriptos en el IVA',
            status: 'ACTIVO'
          }

          chai.request(server)
            .post('/pricelist')
            .set('x-access-token', token)
            .send(priceList)
            .end((error, response) => {
              // console.log('::RESPONSE::', response.body);
              response.should.have.status(200)
              response.body.should.be.a('object')
              response.body.should.have.property('message')
                .eql('Lista de Precios creada con exito')
              response.body.should.have.property('data')
              response.body.data.should.have.property('id').to.be.not.null;
              done()
            })
        })
    })

    it('no deberia crear una Lista de Precios sin nombre', done => {
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
          let priceList = {
            description: 'Lista de precios de clientes inscriptos en el IVA',
            status: 'ACTIVO'
          }

          chai.request(server)
            .post('/pricelist')
            .set('x-access-token', token)
            .send(priceList)
            .end((error, response) => {
              // console.log('::RESPONSE::', response.body);
              response.should.have.status(422)
              response.body.should.be.a('object')
              response.body.should.have.property('message')
                .eql('Debe proporcionar un nombre para la lista de precios')
              response.body.should.have.property('data').to.be.null
              done()
            })
        })      
    })
    
    it('no deberia crear una Lista de Precios sin descripcion', done => {
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
          let priceList = {
            name: 'Precios con IVA',
            status: 'ACTIVO'
          }

          chai.request(server)
            .post('/pricelist')
            .set('x-access-token', token)
            .send(priceList)
            .end((error, response) => {
              // console.log('::RESPONSE::', response.body);
              response.should.have.status(422)
              response.body.should.be.a('object')
              response.body.should.have.property('message')
                .eql('Debe proporcionar una descripcion para la lista de precios')
              response.body.should.have.property('data').to.be.null
              done()
            })
        })      
    })

    it('no deberia crear una Lista de Precios sin estado', done => {
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
          let priceList = {
            name: 'Precios con IVA',
            description: 'Lista de precios de clientes inscriptos en el IVA',
          }

          chai.request(server)
            .post('/pricelist')
            .set('x-access-token', token)
            .send(priceList)
            .end((error, response) => {
              // console.log('::RESPONSE::', response.body);
              response.should.have.status(422)
              response.body.should.be.a('object')
              response.body.should.have.property('message')
                .eql('Debe proporcionar el estado de la Lista de Precios')
              response.body.should.have.property('data').to.be.null
              done()
            })
        })      
    })

    it('el estado de la lista de precios deber ser ACTIVO o INACTIVO', done => {
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
          let priceList = {
            name: 'Precios con IVA',
            description: 'Lista de precios de clientes inscriptos en el IVA',
            status: 'HABILITADO'
          }

          chai.request(server)
            .post('/pricelist')
            .set('x-access-token', token)
            .send(priceList)
            .end((error, response) => {
              // console.log('::RESPONSE::', response.body);
              response.should.have.status(422)
              response.body.should.be.a('object')
              response.body.should.have.property('message')
                .eql('La Lista de Precios solo puede estar en estado ACTIVO o INACTIVO')
              response.body.should.have.property('data').to.be.null
              done()
            })
        })      
    })

    it('no deberia crear una lista de precios con nombre duplicado', done => {
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
          let priceList = {
            name: 'Precios con IVA',
            description: 'Lista de precios de clientes inscriptos en el IVA',
            status: 'ACTIVO'
          }

          let newPriceList = new PriceList(priceList)
          newPriceList.save()
            .then(user => console.log())
            .catch(error => console.error('TEST:', error))

          chai.request(server)
            .post('/pricelist')
            .set('x-access-token', token)
            .send(priceList)
            .end((error, response) => {
              // console.log('::RESPONSE::', response.body);
              response.should.have.status(422)
              response.body.should.be.a('object')
              response.body.should.have.property('message')
                .eql('La Lista de Precios ya existe')
              response.body.should.have.property('data').to.be.null;
              done()
            })
        })      
    })
  })
  // GET /pricelist - obtiene una lista de precios por su id
  describe('GET /pricelist/:pricelistId', () => {
    it('deberia obtener una Lista de Precios por su id', done => {
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
          let priceList = new PriceList({
            name: 'Precios con IVA',
            description: 'Lista de Precios de Clientes inscriptos en el IVA',
            status: 'ACTIVO'
          })

          priceList.save()
            .then(() => console.log())
            .catch(error => console.error('TEST: ', error))

          chai.request(server)
            .get('/pricelist/'+priceList._id)
            .set('x-access-token', token)
            .end((error, response) => {
              response.should.have.status(200)
              response.body.should.be.a('object')
              response.body.should.have.property('message')
                .eql('Lista de Precios obtenida con exito')
              response.body.should.have.property('data')
              response.body.data.should.have.property('name')
                .eql('Precios con IVA')
              response.body.data.should.have.property('description')
                .eql('Lista de Precios de Clientes inscriptos en el IVA')
              response.body.data.should.have.property('status')
                .eql('ACTIVO')
              done()
            })
        })      
    })
  })
})