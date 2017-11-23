const mongoose = require('mongoose')
const cfg = require('./config')

// Configuracion de la base de datos

// Promesas por omision nativas
mongoose.Promise = global.Promise
// Conexion a la base de datos
//mongoose.connect('mongodb://localhost:27017/authentication')
const connectionString = cfg.uri
mongoose.connect(connectionString, cfg.mongoclient)
const db = mongoose.connection

db.on('connect', error => {
  console.log(`Conectado a la base de datos en: ${connectionString}`)
})

db.on('error', error => {
  console.log(`Error de conexion: No se pudo conectar a: ${connectionString}`)
  // process.exit(1)
})
