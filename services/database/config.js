module.exports = {
  port: process.env.MONGODB_PORT||'27017',
  url: process.env.MONGODB_URL||'localhost',
  db: process.env.MONGODB_DB||'inventory'
}