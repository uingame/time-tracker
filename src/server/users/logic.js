const {hash} = require('bcrypt')
const {mapValues} = require('lodash')
const Model = require('./model')
const UserError = require('../common/UserError')

const SALT_ROUNDS = 12
const DUPLICATE_KEY_REG_EXP = /index: ([A-Za-z]*)/

module.exports = {

  getAllUsers: async function() {
    const users = await Model.find().ne('isArchived', true).exec()
    return users
  },

  getUserById: async function(id) {
    const user = await Model.findById(id).exec()
    return user
  },

  getUserByUsernameAndPassword: async function(username, password) {
    const user = await Model.findOne({user})
    .or([{username}, {email: username}])
    .eq('password', password)
    .exec()
    return user
  },

  addUser: async function(newUser) {
    const passwordHash = (!newUser.password) ? undefined : await hash(newUser.password, SALT_ROUNDS)
    try {
      const user = await Model.create({
        ...newUser,
        password: passwordHash
      })
      return user
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new UserError(err._message, mapValues(err.errors, e => e.message))
      } else if (err.code === 11000) {
        const [_, key] = DUPLICATE_KEY_REG_EXP.exec(err.message)
        throw new UserError('User creation failed', {
          [key]: 'already exists'
        })
      }
      throw err
    }
  },

  updateUser: async function(id, updatedFields) {
    const user = await model.findByIdAndUpdate(id, updatedFields, {
      lean: true,
      new: true,
      runValidators: true
    }).exec()
    return user;
  },

  archiveUser: async function(id) {
    const user = await model.findByIdAndUpdate(id, {isArchived: true}, {
      lean: true
    }).exec()
    return true;
  }

}
