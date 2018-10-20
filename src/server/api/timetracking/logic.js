const {mapValues} = require('lodash')
const moment = require('moment')
const Model = require('../reports/model')
const UserError = require('../../common/UserError')

module.exports = {

  async getMonthTimeTracking(user, month, year, userId) {
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
      userId: (user.isAdmin && userId) ? userId : user._id,
      date: {
        $gte: firstTimestamp,
        $lt: lastTimestamp
      }
    })
      .sort('date startTime')
      .exec()
    return reports
  },

  async addTimeTrackingReport(user, reportData) {
    validateReportDate(user, reportData.date)
    const newReport = reportData
    if (!user.isAdmin || !reportData.userId) {
      newReport.userId = user._id
    }
    try {
      const report = await Model.create(newReport)
      return report
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new UserError(err._message, mapValues(err.errors, e => e.message))
      }
      throw err
    }
  },

  async updateTimeTrackingReport(user, reportId, updatedFields) {
    validateReportDate(user, updatedFields.date)
    delete updatedFields.createdAt
    updatedFields.modifiedAt = new Date()
    let userId = user._id
    if (user.isAdmin && updatedFields.userId) {
      userId = updatedFields.userId
    } else {
      delete updatedFields.userId
    }
    try {
      const report = await Model.findOneAndUpdate({
        _id: reportId,
        userId
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
    const deleteReq = {
      _id: reportId
    }
    if (!user.isAdmin) {
      deleteReq.userId = user._id
    }
    const {ok, n} = await Model.deleteOne(deleteReq)
    if (ok && n > 0) {
      return {success: true}
    } else {
      throw new UserError('Report not found')
    }
  }

}

function validateReportDate(user, reportDate) {
  if (user.isAdmin || !reportDate) {
    return
  }

  let firstAllowedDate = moment.utc({day: 1})
  if (moment.utc().date() <= user.lastReportDay) {
    firstAllowedDate = firstAllowedDate.add(-1, 'months')
  }

  if (moment.utc(reportDate).isBefore(firstAllowedDate)) {
    throw new UserError(`Not allowed to update time tracking before ${firstAllowedDate}`)
  }
}
