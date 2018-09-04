module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,

  jwtSecret: process.env.JWT_SECRET || 'jwtsecret',
  jwtIssuer: process.env.JWT_ISSUER || 'uingame',
  jwtExpiration: process.env.JWT_EXPIRATION || '30 days',

  mongoUri: process.env.MONGO_URI || 'mongodb://localhost/time-tracker'
}
