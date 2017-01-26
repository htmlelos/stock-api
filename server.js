"use strict";
const cors = require('cors')
const express = require('express')
const server = express()
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const morgan = require('morgan')
const config = require('config')
const mongoose = require('./services/database/mongoose')
const superUser = require('./services/security/superuser')
const routes = require('./routes/routes')

const port = process.env.REST_PORT || 3000
server.use(cors())
// No mostrar la bitacora cuando se hacen las pruebas
if(config.util.getEnv('NODE_ENV') !== 'test') {
// Utiliza morgan para la bitacora en la linea de comandos
// Apache log style - Bitacora al estilo de Apache
	// server.use(morgan('combined'))
	server.use(morgan('dev'))
}

server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json())
server.use(expressValidator())
superUser(server)
	// Routes
routes(server)

server.listen(config.port, function() {
	console.log('Servicio ejecutandose en el puerto: ' + port);
})


process.on('unhandledRejection', reason => {
	console.error('UNHANDLED :' , reason);
})
// process.on('uncaughtException', error => {
//     console.error('--ERROR--', error);
//     if (error.syscall !== 'listen')
//       throw error
//
//     switch (error.code) {
//       case 'EACCESS':
//         console.error('El puerto ' + port + ' no posee los permisos necesarios')
//         //process.exit(1)
//         break
//       case 'EADDRINUSE':
//         console.error('El puerto ' + port + ' ya se encuentra en uso')
//         //process.exit(1)
//         break
//       default:
//         throw error
//     }
// })
// Exporta para ser utilizado en el testing
module.exports = server
