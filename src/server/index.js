const express = require('express')
const fallback = require('express-history-api-fallback')
const bodyParser = require('body-parser')
const config = require('./config')
const auth = require('./auth/router')
const {UserError} = require('./common').errors

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.connection.remoteAddress}] - ${req.method} ${req.protocol}://${req.hostname}${req.path}`)
  next()
})

const apiRouter = new express.Router()

apiRouter.get('/test',
  (req, res, next) => {
    res.send({success: true})
  }
)

apiRouter.use('/auth', auth)

apiRouter.use((req, res, next) => {
  res.status(404).json({error: 'Endpoint doesn\'t exist'})
})

//general error handler
apiRouter.use((err, req, res, next) => {
  console.error(err)
  if (err instanceof UserError) {
    res.status(400).json({error: err.message})
  } else {
    res.status(500).json({error: 'Internal Server Error'})
  }
})

app.use('/api', apiRouter)

const publicFolder = 'dist'
app.use(express.static(publicFolder))
app.use(fallback('index.html', { root: publicFolder }))

app.listen(config.port, () => {
  console.log(`Listening on port ${config.port}...`)
})
