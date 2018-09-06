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

router.get('/:id', makeEndpoint(
  ({params: {id}}) => logic.getUserById(id)
))

router.put('/:id', makeEndpoint(
  ({params: {id}, body}) => logic.updateUser(id, body)
))

router.delete('/:id', makeEndpoint(
  ({params: {id}}) => logic.archiveUser(id)
))

module.exports = router
