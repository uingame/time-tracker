const mongoose = require('mongoose')
const config = require('./config')

require('mongoose-type-email')

async function configureMongoose() {
  mongoose.set('debug', true)
  mongoose.set('useCreateIndex', true)
  mongoose.set('useFindAndModify', false)
  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    reconnectTries: Number.MAX_VALUE
  })

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'mongodb connection error:'));
  db.once('open', () => {
    console.log('mongodb connected successfully!')
  });
}

module.exports = {
  configureMongoose
}
