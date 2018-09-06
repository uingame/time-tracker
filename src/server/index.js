const express = require('express')
const fallback = require('express-history-api-fallback')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const config = require('./config')
const users = require('./users/router')
const auth = require('./auth/router')
const UserError = require('./common/UserError')

const PUBLIC_FOLDER = 'dist'

configureMongoose()

const app = express()

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.connection.remoteAddress}] - ${req.method} ${req.protocol}://${req.hostname}${req.path}`)
  next()
})

app.use('/api', createApiRouter())

app.use(express.static(PUBLIC_FOLDER))
app.use(fallback('index.html', { root: PUBLIC_FOLDER }))

app.listen(config.port, () => {
  console.log(`Listening on port ${config.port}...`)
})

function createApiRouter() {
  const router = new express.Router()

  router.use(bodyParser.json())

  router.use('/auth', auth)
  router.use('/users', users)

  router.use('*', (req, res, next) => {
    res.status(404).json({error: 'Endpoint doesn\'t exist'})
  })

  //general error handler
  router.use((err, req, res, next) => {
    if (err instanceof UserError) {
      console.debug(err)
      const ret = {
        error: err.message
      }
      if (err.fields) {
        ret.fields = err.fields
      }
      res.status(400).json(ret)
    } else {
      console.error(err)
      res.status(500).json({error: 'Internal Server Error'})
    }
  })

  return router
}

async function configureMongoose() {
  mongoose.set('debug', true)
  mongoose.set('useCreateIndex', true)
  mongoose.set('useFindAndModify', false)
  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true
  })

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'mongodb connection error:'));
  db.once('open', () => {
    console.log('mongodb connected successfully!')
  });
}
