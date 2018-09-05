const bcrypt = require('bcrypt')
const {get, mapValues} = require('lodash')
const Model = require('./model')
const UserError = require('../common/UserError')

const SALT_ROUNDS = 12
const DUPLICATE_KEY_REG_EXP = /index: ([A-Za-z]*)/

module.exports = {

  async getAllUsers() {
    const users = await Model.find().ne('isArchived', true).exec()
    return users
  },

  async getUserById(id) {
    const user = await Model.findById(id).exec()
    return user
  },

  async getUserByUsernameAndPassword(username, password) {
    const user = await Model.findOne()
      .or([{username}, {email: username}])
      .exec()

    const isPasswordMatch = await bcrypt.compare(password, get(user, 'password', ''))
    return isPasswordMatch ? user : undefined
  },

  async addUser(newUser) {
    const passwordHash = (!newUser.password) ? undefined : await bcrypt.hash(newUser.password, SALT_ROUNDS)
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

  async updateUser(id, updatedFields) {
    const user = await model.findByIdAndUpdate(id, updatedFields, {
      lean: true,
      new: true,
      runValidators: true
    }).exec()
    return user;
  },

  async archiveUser(id) {
    const user = await model.findByIdAndUpdate(id, {isArchived: true}, {
      lean: true
    }).exec()
    return true;
  }

}
