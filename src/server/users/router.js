const express = require('express')
const logic = require('./logic')

const makeEndpoint = fn => async (req, res, next) => {
  try {
    const result = await fn(req, res)
    res.json(result)
  } catch(err) {
    next(err)
  }
}

const router = new express.Router()

router.get('/', makeEndpoint(
  () => logic.getAllUsers()
))

router.post('/', makeEndpoint(
  ({body}) => logic.addUser(body)
))

module.exports = router
