const {uniq, map, groupBy, mapValues, sumBy, get} = require('lodash')
const Model = require('./model')
const usersLogic = require('../users/logic')
const clientsLogic = require('../clients/logic')
const activitiesLogic = require('../activities/logic')
const UserError = require('../../common/UserError')

async function getReports(startDate, endDate, group, filter) {
  if (!startDate) {
    throw new UserError('startDate is required!', {startDate: 'required!'})
  }
  if (!endDate) {
    throw new UserError('endDate is required!', {endDate: 'required!'})
  }

  let query = Model.find({
    date: {
      $gte: startDate,
      $lt: endDate
    }},
    null, {
      sort: {
        date: 1,
        startTime: 1,
        endTime: 1
      }
    })

  if (filter) {
    if (filter.users) {
      query = query.in('userId', filter.users)
    }
    if (filter.clients) {
      query = query.in('clientId', filter.clients)
    }
    if (filter.activities) {
      query = query.in('activityId', filter.activities)
    }
  }

  const reportModels = await query.exec()
  const reports = reportModels.map(r => r.toJSON())
  const [users, clients, activities] = await Promise.all([
    usersLogic.getMultipleUsers(uniq(reports.map(r => r.userId))),
    clientsLogic.getMultipleClients(uniq(reports.map(r => r.clientId))),
    activitiesLogic.getMultipleActivities(uniq(reports.map(r => r.activityId)))
  ])

  populate(reports, users, clients, activities)

  if (group === 'client') {
    const reportsByClient = groupBy(reports, r => r.clientId)
    return mapValues(reportsByClient, (reports, clientId) => {
      const client = clients.find(({id}) => id === clientId)
      return {
        reports,
        totalHours: sumBy(reports, r => r.duration),
        totalPrice: calculateReportsTotalPrice(reports, client)
      }
    })
  } else if (group === 'user') {
    const reportsByUser = groupBy(reports, r => r.userId)
    return mapValues(reportsByUser, (reports, userId) => {
      const user = users.find(({id}) => id === userId)
      return {
        reports,
        totalHours: sumBy(reports, r => r.duration),
        ...calculateUserSalary(reports, user)
      }
    })
  } else {
    return reports
  }
}

function populate(reports, users, clients, activities) {
  reports.forEach(report => {
    const user = users.find(({id}) => Number(id) === report.userId)
    const client = clients.find(({id}) => Number(id) === report.clientId)
    const activity = activities.find(({id}) => id === report.activityId)
    report.username = get(user, 'displayName')
    report.activityName = get(activity, 'name')
    report.clientName = get(client, 'name')
  })
}

function calculateReportsTotalPrice(reports, client) {
  return reports.reduce((ret, {activityId, duration}) => {
    const clientActivity = get(client, 'activities', []).find(a => a.activityId === activityId)
    const hourlyQuote = get(clientActivity, 'hourlyQuote')
    const price = hourlyQuote || 0
    return ret + price*duration
  }, 0)
}

function calculateUserSalary(reports, user) {
  const salary = reports.reduce((ret, {activityId, clientId, duration}) => {
    const activity = user.activities.find(a => a.activityId === activityId && a.clientId === clientId)
    const quote = (activity && activity.hourlyQuote) || user.defaultHourlyQuote || 0
    return ret + quote*duration
  }, 0)

  const reportsByWorkdays = map(groupBy(reports, r => r.date))
  const travelSalary = reportsByWorkdays.reduce((ret, dayReports) => {
    return ret + Math.max(...dayReports.map(({activityId, clientId}) => {
      const activity = user.activities.find(a => a.activityId === activityId && a.clientId === clientId)
      return (activity && activity.travelQuote) || user.defaultTravelQuote || 0
    }))
  }, 0)

  return {
    numberOfWorkdays: reportsByWorkdays.length,
    salary,
    travelSalary,
    totalSalary: salary + travelSalary
  }
}

module.exports = {
  getReports,

  async getReportsByMonth(month, year, groupBy, filter) {
    if (month > 12 || month < 1) {
      throw new UserError('Month must be between 1 and 12!', {month: 'must be between 1 and 12!'})
    }
    firstTimestamp = new Date(Date.UTC(year, month-1, 1, 0, 0, 0)).toUTCString()
    lastTimestamp = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toUTCString()
    return await getReports(firstTimestamp, lastTimestamp, groupBy, filter)
  },
}
