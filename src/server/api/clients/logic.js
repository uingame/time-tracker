const {mapValues} = require('lodash')
const Model = require('./model')
const UserError = require('../../common/UserError')

const DUPLICATE_KEY_REG_EXP = /index: ([A-Za-z]*)/

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
      } else if (err.code === 11000) {
        const [_, key] = DUPLICATE_KEY_REG_EXP.exec(err.message)
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
