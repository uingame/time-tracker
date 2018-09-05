const express = require('express')
const logic = require('./logic')
const {IsAuthenticated, IsAdmin} = require('../auth/middleware')

const makeEndpoint = fn => async (req, res, next) => {
  try {
    const result = await fn(req, res)
    res.json(result)
  } catch(err) {
    next(err)
  }
}

const router = new express.Router()

router.use(IsAuthenticated)
router.use(IsAdmin)

router.get('/', makeEndpoint(
  () => logic.getAllUsers()
))

router.post('/', makeEndpoint(
  ({body}) => logic.addUser(body)
))

module.exports = router
