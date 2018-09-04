const util = require('util')
const {Router} = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt')
const UserError = require('../common/UserError')

const config = require('../config')

let router = Router()

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, util.callbackify(getUserByEmailAndPassword)))

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
  issuer: config.jwtIssuer,
  algorithems: ['HS256']
}, util.callbackify(getUserByJwtPayload)))


router.post('/token',
  passport.authenticate('local', {session: false}),
  async (req, res) => {
    const token = await createJsonWebToken(req.user.username)
    console.log(`token created for: ${req.user.username}`)
    res.json({
      username: req.user.username,
      token
    })
  }
)

router.get('/user',
  passport.authenticate('jwt', {session: false}),
  (req, res, next) => {
    res.json({
      username: req.user.username
    })
  }
)

const JWT_OPTIONS = {
  issuer: config.jwtIssuer,
  expiresIn: config.jwtExpiration
}
const createJsonWebToken = util.promisify((username, done) => jwt.sign({username}, config.jwtSecret, JWT_OPTIONS, done))

async function getUserByEmailAndPassword(username, password) {
  if (username === 'arik' && password === '1234') {
    return {
      username: 'arik',
      isAdmin: true
    }
  }
  throw new UserError('Incorrect username or password.')
}

async function getUserByJwtPayload({username}) {
  if (username === 'arik') {
    return {
      username: 'arik',
      isAdmin: true
    }
  }
  throw new UserError('User not found.')
}



module.exports = router
