'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Brand = require('../models/brand')
const Supplier = require('../models/supplier')
const settings = require('../settings.cfg')
	// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)
//Bloque principal de las pruebas de Marcas
describe('BRAND TEST SUITE', () => {
  beforeEach(done => {
    Brand.remove({}, error => {})
    Supplier.remove({}, error => {})
    done()
  })

  // GET /brands - Obtener todas las marcas
  describe('GET /brands', () => {
    it('deberia obtener todas las marcas', done => {
      let user = {
				username: 'admin@mail.com',
				password: 'admin'
			}

			let token = jwt.sign(user, settings.secret, {
				expiresIn: '8h'
			})

      chai.request(server)
        .get('/brands')
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

  describe('POST /brand', () => {
    it('deberia crear una nueva marca', done => {
      let brand ={
        name: 'Coca cola',
        description: 'Bebida Gaseosa',
        suppliers: []
      }

      let user = {
        username: 'admin@mail.com',
        password: 'admin'
      }

      let token = jwt.sign(user, settings.secret, {
        expiresIn: '8h'
      })

      chai.request(server)
        .post('/brand')
        .set('x-access-token', token)
        .send(brand)
        .end((error, response) => {
          console.log('::RESPONSE-BODY::', response.body);
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message').eql('Marca creada con exito')
          response.body.should.have.property('data').eql(null)
          done()
        })
    })
  })
})
