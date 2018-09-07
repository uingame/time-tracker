const {mapValues} = require('lodash')
const Model = require('./model')
const UserError = require('../../common/UserError')

const DUPLICATE_KEY_REG_EXP = /index: ([A-Za-z]*)/

module.exports = {

  async getAllActivities() {
    const activities = await Model.find().ne('isArchived', true).exec()
    return activities
  },

  async getActivityById(id, includeSalaryOptions) {
    const activity = await Model.findById(id).ne('isArchived', true).exec()
    if (!activity) {
      throw new UserError('Activity not found')
    }
    return activity
  },

  async addActivity(newActivity) {
    try {
      const activity = await Model.create(newActivity)
      return activity
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new UserError(err._message, mapValues(err.errors, e => e.message))
      } else if (err.code === 11000) {
        const [_, key] = DUPLICATE_KEY_REG_EXP.exec(err.message)
        throw new UserError('Activity creation failed', {
          [key]: 'already exists'
        })
      }
      throw err
    }
  },

  async updateActivity(id, updatedFields) {
    try {
      const activity = await Model.findByIdAndUpdate(id, updatedFields, {
        new: true,
        runValidators: true
      }).ne('isArchived', true).exec()
      if (!activity) {
        throw new UserError('Activity not found')
      }
      return activity;
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new UserError(err._message, mapValues(err.errors, e => e.message))
      } else if (err.name === 'CastError') {
        throw new UserError(`${err.path} must be a '${err.kind}'`, {[err.path]: `not a ${err.kind}`})
      } else if (err.code === 11000) {
        const [_, key] = DUPLICATE_KEY_REG_EXP.exec(err.message)
        throw new UserError('Activity update failed', {
          [key]: 'already exists'
        })
      }
      throw err
    }

  },

  async archiveActivity(id) {
    const update = {
      isArchived: true,
      $rename: {
        name: '_name'
      }
    }
    const activity = await Model.findByIdAndUpdate(id, update, {
      lean: true
    })
      .ne('isArchived', true)
      .exec()
    return {result: !!activity};
  }

}
