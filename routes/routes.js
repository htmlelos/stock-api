const common = require('./common')
const security = require('./security')
const role = require('./role')
const profile = require('./profile')
const user = require('./user')
const supplier = require('./supplier')
const brand = require('./brand')
const products = require('./products')

module.exports = function routes(server) {
  server.use('/', common)
  server.use('/', security)
  server.use('/', role)
  server.use('/', profile)
  server.use('/', user)
  server.use('/', supplier)
  server.use('/', brand)
  server.use('/', products)
}
