const {mapValues} = require('lodash')
const Model = require('../reports/model')
const activities = require('../activities/logic')
const UserError = require('../../common/UserError')

module.exports = {

  async getMonthTimeTracking(user, month, year) {
    if (!month) {
      throw new UserError('Month is required!', {month: 'required!'})
    }
    if (month > 12 || month < 1) {
      throw new UserError('Month must be between 1 and 12!', {month: 'must be between 1 and 12!'})
    }
    if (!year) {
      throw new UserError('Year is required!', {year: 'required!'})
    }
    firstTimestamp = new Date(Date.UTC(year, month-1, 1, 0, 0, 0)).toUTCString()
    lastTimestamp = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toUTCString()
    const reports = await Model.find({
      userId: user.id,
      date: {
        $gte: firstTimestamp,
        $lt: lastTimestamp
      }
    }).exec()
    return reports
  },

  async addTimeTrackingReport(user, newReport) {
    try {
      const report = await Model.create({
        ...newReport,
        userId: user.id
      })
      return report
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new UserError(err._message, mapValues(err.errors, e => e.message))
      }
      throw err
    }
  },

  async updateTimeTrackingReport(user, reportId, updatedFields) {
    try {
      const report = await Model.findOneAndUpdate({
        _id: reportId,
        userId: user.id
      },
      updatedFields, {
        new: true,
        runValidators: true
      }).exec()
      if (!report) {
        throw new UserError('Report not found')
      }
      return report;
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new UserError(err._message, mapValues(err.errors, e => e.message))
      }
      throw err
    }
  },

  async deleteTimeTrackingReport(user, reportId) {
    const {ok, n} = await Model.deleteOne({
      _id: reportId,
      userId: user.id
    })
    if (ok && n > 0) {
      return {success: true}
    } else {
      throw new UserError('Report not found')
    }
  }

}
