import { func } from 'prop-types';

const util = require('util')
const {get} = require('lodash')
const passport = require('passport')

export const IsAuthenticated = passport.authenticate('jwt', {session: false})

export function IsAdmin(req, res, next) {
  if (get(req, 'user.isAdmin')) {
    next()
    return
  }

  res.status(403).send('Forbidden')
}
