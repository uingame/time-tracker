const {mapValues} = require('lodash')
const Model = require('./model')
const UserError = require('../../common/UserError')

const DUPLICATE_KEY_REG_EXP = /index: ([A-Za-z]*)/
const ACTIVITY_ID_REG_EXP = /activityId: '(\w*)'/

module.exports = {

  async getAllClients() {
    const clients = await Model.find().ne('isArchived', true).exec()
    return clients
  },

  async getClientById(id) {
    const client = await Model.findById(id).ne('isArchived', true).exec()
    if (!client) {
      throw new UserError('Client not found')
    }
    return client
  },

  async addClient(newClient) {
    try {
      const client = await Model.create(newClient)
      return client
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new UserError(err._message, mapValues(err.errors, e => e.message))
      } else if (err.code === 11000) {
        const [_, key] = DUPLICATE_KEY_REG_EXP.exec(err.message)
        throw new UserError('Client creation failed', {
          [key]: 'already exists'
        })
      }
      throw err
    }
  },

  async updateClient(id, updatedFields) {
    try {
      const client = await Model.findByIdAndUpdate(id, updatedFields, {
        new: true,
        runValidators: true
      }).ne('isArchived', true).exec()
      if (!client) {
        throw new UserError('Client not found')
      }
      return client;
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new UserError(err._message, mapValues(err.errors, e => e.message))
      } else if (err.name === 'CastError') {
        if (err.kind === 'embedded' && err.path === 'activities') {
          const errId = ACTIVITY_ID_REG_EXP.exec(err.value)[1]
          const idx = updatedFields.activities.findIndex(({activityId}) => activityId === errId)
          throw new UserError(`${err.reason.path} must be a '${err.reason.kind}'`, {[`${err.path}.${idx}.${err.reason.path}`]: `not a ${err.reason.kind}`})
        }
        throw new UserError(`${err.path} must be a '${err.kind}'`, {[err.path]: `not a ${err.kind}`})
      } else if (err.code === 11000) {
        const key = DUPLICATE_KEY_REG_EXP.exec(err.message)[1]
        throw new UserError('Client update failed', {
          [key]: 'already exists'
        })
      }
      throw err
    }

  },

  async archiveClient(id) {
    const update = {
      isArchived: true,
      $rename: {
        name: '_name'
      }
    }
    const client = await Model.findByIdAndUpdate(id, update, {
      lean: true
    })
      .ne('isArchived', true)
      .exec()
    return {result: !!client};
  }

}
