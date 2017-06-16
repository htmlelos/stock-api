"use strict";
process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

// Check if server is online
// Verifica si el servicio esta en linea
describe('SERVER: test suite', () => {
	it('GET /ping should return pong', done => {
		chai.request(server)
			.get('/ping')
			.end((error, response) => {
				response.should.have.status(200)
				response.body.should.be.a('string')
				response.body.should.be.eql('pong')
				done()
			})
	})
})
