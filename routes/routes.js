const common = require('./common')
const security = require('./security')
const role = require('./role')
const profile = require('./profile')
const user = require('./user')
const person = require('./person')
const brand = require('./brand')
const priceList = require('./priceList')
const product = require('./product')
const document = require('./document')

module.exports = function routes(server) {
  server.use('/', common)
  server.use('/', security)
  server.use('/', role)
  server.use('/', profile)
  server.use('/', user)
  server.use('/', person)
  server.use('/', brand)
  server.use('/', priceList)
  server.use('/', product)
  server.use('/', document)
}
