let mongodbUri = (process.env.NODE_ENV === 'test') ?
  {
    uri: 'mongodb://localhost:27017/test',
    mongoclient: { useMongoClient: true }
  } :
  {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory',
    mongoclient: { useMongoClient: true }
  }

module.exports = mongodbUri