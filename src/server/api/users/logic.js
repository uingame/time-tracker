const bcrypt = require('bcrypt')
const {get, mapValues} = require('lodash')
const Model = require('./model')
const UserError = require('../../common/UserError')
const counters = require('../../common/counters')

const SALT_ROUNDS = 12
const DUPLICATE_KEY_REG_EXP = /index: ([A-Za-z]*)/

module.exports = {

  async getAllUsers() {
    const users = await Model.find().ne('isArchived', true).exec()
    return users
  },

  async getMultipleUsers(userIds) {
    const users = await Model.find().in('_id', userIds).exec()
    return users
  },

  async getUserById(id) {
    const user = await Model.findById(id).ne('isArchived', true).exec()
    if (!user) {
      throw new UserError('User not found')
    }
    return user
  },

  async getUserByUsernameAndPassword(username, password) {
    const user = await Model.findOne()
      .ne('isArchived', true)
      .or([{username}, {email: username}])
      .exec()

    const isPasswordMatch = await bcrypt.compare(password, get(user, 'password', ''))
    return isPasswordMatch ? user : undefined
  },

  async addUser(newUser) {
    const passwordHash = (!newUser.password) ? undefined : await bcrypt.hash(newUser.password, SALT_ROUNDS)
    const _id = await counters.getNextId('users')
    try {
      const user = await Model.create({
        ...newUser,
        _id,
        password: passwordHash,
        isSystem: false
      })
      return user
    } catch (err) {
      counters.cancelId('users', _id)
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
    delete updatedFields.isSystem
    delete updatedFields.createdAt
    updatedFields.modifiedAt = new Date()
    if (updatedFields.password === '') {
      delete updatedFields.password
    }
    try {
      const user = await Model.findByIdAndUpdate(id, updatedFields, {
        new: true,
        runValidators: true
      }).ne('isArchived', true).exec()
      if (!user) {
        throw new UserError('User not found')
      }
      return user;
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new UserError(err._message, mapValues(err.errors, e => e.message))
      } else if (err.name === 'CastError') {
        // if (err.kind === 'embedded' && err.path === 'activities') {
        //   const errId = ACTIVITY_ID_REG_EXP.exec(err.value)[1]
        //   const idx = updatedFields.activities.findIndex(({activityId}) => activityId === errId)
        //   throw new UserError(`${err.reason.path} must be a '${err.reason.kind}'`, {[`${err.path}.${idx}.${err.reason.path}`]: `not a ${err.reason.kind}`})
        // }
        throw new UserError(`${err.path} must be a '${err.kind}'`, {[err.path]: `not a ${err.kind}`})
      } else if (err.code === 11000) {
        const [_, key] = DUPLICATE_KEY_REG_EXP.exec(err.message)
        throw new UserError('User update failed', {
          [key]: 'already exists'
        })
      }
      throw err
    }

  },

  async archiveUser(id) {
    const update = {
      isArchived: true,
      $rename: {
        username: '_username',
        idNumber: '_idNumber',
        email: '_email'
      }
    }
    const user = await Model.findByIdAndUpdate(id, update, {
      lean: true
    })
      .ne('isSystem', true)
      .ne('isArchived', true)
      .exec()
    return {result: !!user};
  }

}
