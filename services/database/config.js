let mongodbUri = (process.env.NODE_ENV === 'test') ? { uri: 'mongodb://localhost:27017/test' } : { uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory' }

module.exports = mongodbUri