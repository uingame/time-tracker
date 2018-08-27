const util = require('util')
const {Router} = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt')
const {errors: {UserError}} = require('../common')

const config = require('../config')

let router = Router()

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, util.callbackify(getUserByEmailAndPassword)))

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
  issuer: config.jwtIssuer,
  audience: config.jwtAudience,
  algorithems: ['HS256']
}, util.callbackify(getUserByJwtPayload)))


router.post('/token',
  passport.authenticate('local', {session: false}),
  util.callbackify(async (req, res) => {
    const token = await createJsonWebToken(req.user.email)
    res.json({
      email: req.user.email,
      username: req.user.username,
      token
    })
  })
)

router.get('/user',
  passport.authenticate('jwt', {session: false}),
  (req, res, next) => {
    res.json({
      email: req.user.email,
      username: req.user.username,
    })
  }
)

const JWT_OPTIONS = {
  issuer: config.jwtIssuer,
  audience: config.jwtAudience,
  expiresIn: config.jwtExpiration
}
const createJsonWebToken = util.promisify((email, done) => jwt.sign({email}, config.jwtSecret, JWT_OPTIONS, done))

async function getUserByEmailAndPassword(email, password) {
  if (email === 'arikmaor@gmail.com' && password === '1234') {
    return {
      email: 'arikmaor@gmail.com',
      username: 'arik'
    }
  }
  throw new UserError('Incorrect username or password.')
}

async function getUserByJwtPayload({email}) {
  if (email === 'arikmaor@gmail.com') {
    return {
      email: 'arikmaor@gmail.com',
      username: 'arik'
    }
  }
  throw new UserError('User not found.')
}



module.exports = router
