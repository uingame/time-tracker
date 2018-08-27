module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,

  jwtSecret: process.env.JWT_SECRET || 'jwtsecret',
  jwtIssuer: process.env.JWT_ISSUER || 'auth',
  jwtAudience: process.env.JWT_AUDIENCE || 'web-app',
  jwtExpiration: process.env.JWT_EXPIRATION || '30 days'
}
