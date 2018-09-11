import React from 'react'
import PropTypes from 'prop-types'
import {get, without} from 'lodash'
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import ActivityIndicator from 'common/ActivityIndicator'

import {getSignedInUser} from 'core/authService'
import * as timetrackingService from 'core/timetrackingService'
import {getAllActivities} from 'core/activitiesService'
import {getAllClients} from 'core/clientsService'

import moment from 'moment'
import EditableTable from '../common/EditableTable';

const EXTRA_MONTHS = 1
const NEW_PREFIX = 'new_'
const EMPTY_PREFIX = 'empty_'

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700
  },
  cell: {
    fontSize: '1.25rem',
    textAlign: 'right',
    padding: theme.spacing.unit * 1.5
  },
  input: {
    fontSize: '1.25rem',
    direction: 'rtl'
  }
});

let dummyIdCouter = 0

class TimeTracking extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
  }

  state = {
    loading: true,
    loadingMonth: false,
    clients: [],
    activities: [],
    selectedMonth: null,
    data: []
  }

  constructor(props) {
    super(props)
    this.init()
  }

  async init() {
    const [clients, activities] = await Promise.all([
      getAllClients(),
      getAllActivities()
    ])
    const user = getSignedInUser()
    const months = getUserMonths(user)
    this.setState({
      loading: false,
      clients,
      activities: clients.reduce((ret, client) => {
        ret[client._id] = activities
          .filter(activity => client.activities.some(({activityId}) => activityId === activity._id))
        return ret
      }, {}),
      months
    })
    this.selectMonth(months.length-1-EXTRA_MONTHS)
  }

  async selectMonth(e) {
    const idx = get(e, 'target.value', e)
    const selectedMonth = this.state.months[idx]
    this.setState({
      selectedMonth,
      loadingMonth: true
    })
    const reports = await timetrackingService.getMonthTimeTracking(selectedMonth.month, selectedMonth.year)
    let m = moment.utc({year: selectedMonth.year, month: selectedMonth.month-1})
    const data = []
    while (m.month() === selectedMonth.month-1) {
      const datenumber = m.date()
      const dayReports = reports.filter(({date}) => moment.utc(date).date() === datenumber)
      if (dayReports.length === 0) {
        data.push({
          _id: EMPTY_PREFIX + datenumber,
          datenumber,
          date: m.toISOString(),
          weekday: m.format('dddd')
        })
      } else {
        data.push(...dayReports.map((r, idx) => ({
          ...r,
          datenumber: idx === 0 ? datenumber : '',
          weekday: idx === 0 ? m.format('dddd') : ''
        })))
      }
      m = m.add(1, 'd')
    }
    this.setState({
      loadingMonth: false,
      data
    })
  }

  isEmpty(report) {
    return report._id.startsWith(EMPTY_PREFIX)
  }

  isNew(report) {
    return report._id.startsWith(NEW_PREFIX)
  }

  isLastInDay(report) {
    const {data} = this.state
    const idx = data.findIndex(({_id}) => _id === report._id)
    return get(data[idx], 'date') !== get(data[idx+1], 'date')
  }

  async saveReport(report) {
    const {_id, datenumber, weekday, userId, ...reportData} = report
    const isNew = this.isNew(report)
    const updatedReport = isNew ?
      await timetrackingService.addTimeTrackingReport(reportData) :
      await timetrackingService.updateTimeTrackingReport(_id, reportData)

    updatedReport.datenumber = datenumber
    updatedReport.weekday = weekday

    const {data} = this.state
    const idx = data.findIndex(r => r._id === _id)
    this.setState({
      data : [
        ...data.slice(0, idx),
        updatedReport,
        ...data.slice(idx+1)
      ]
    })
  }

  async deleteReport(report) {
    const isNew = this.isNew(report)
    if (!isNew) {
      await timetrackingService.deleteTimeTrackingReport(report._id)
    }

    if (this.isEmpty(report)) {
      return
    }

    const {data} = this.state
    const idx = data.findIndex(r => r === report)

    if (!report.datenumber) { // Not the first line in this date
      this.setState({
        data: without(data, report)
      })
    } else if (get(data[idx+1], 'datenumber')) { // This is the one and only report in this date
      this.setState({
        data: [
          ...data.slice(0, idx),
          {
            _id: EMPTY_PREFIX + report.datenumber,
            datenumber: report.datenumber,
            date: report.date,
            weekday: report.weekday
          },
          ...data.slice(idx+1)
        ]
      })
    } else { // This is the first of multiple report in this date
      this.setState({
        data: [
          ...data.slice(0, idx),
          {
            ...data[idx+1],
            datenumber: report.datenumber,
            weekday: report.weekday,
          },
          ...data.slice(idx+2)
        ]
      })
    }

  }

  addAfter(report) {
    const {data} = this.state
    const idx = data.findIndex(r => r === report)
    if (this.isEmpty(report)) {
      this.setState({
        data: [
          ...data.slice(0, idx),
          {
            ...report,
            _id: NEW_PREFIX + (dummyIdCouter++)
          },
          ...data.slice(idx+1)
        ]
      })
      return
    }
    this.setState({
      data: [
        ...data.slice(0, idx+1),
        {
          _id: NEW_PREFIX + (dummyIdCouter++),
          date: report.date,
          name: '',
          defaultHourlyQuote: 0,
          notes: ''
        },
        ...data.slice(idx+1)
      ]
    })
  }

  render() {
    const {classes} = this.props
    const {loading, loadingMonth, months, selectedMonth, clients, activities, data} = this.state

    if (loading) {
      return <ActivityIndicator />
    }

    return (
      <React.Fragment>
        <Select
          className={classes.input}
          value={months.indexOf(selectedMonth)}
          onChange={this.selectMonth}
        >
          {months.map((month, idx) => (
            <MenuItem key={idx} value={idx}>{month.display}</MenuItem>
          ))}
        </Select>
        {loadingMonth ? <ActivityIndicator /> : (
          <Paper className={classes.root}>
            <EditableTable
              headers={[{
                id: 'datenumber',
                title: 'תאריך',
                type: 'readonly'
              }, {
                id: 'weekday',
                title: 'יום',
                type: 'readonly'
              }, {
                id: 'startTime',
                title: 'זמן התחלה',
                type: 'time',
                focus: true
              }, {
                id: 'endTime',
                title: 'זמן סיום',
                type: 'time'
              }, {
                id: 'duration',
                type: 'number',
                title: 'מס שעות'
              }, {
                id: 'clientId',
                title: 'לקוח',
                select: clients,
                idField: '_id',
                displayField: 'name'
              }, {
                id: 'activityId',
                title: 'פעילות',
                select: ({clientId}) => activities[clientId],
                idField: '_id',
                displayField: 'name'
              }, {
                id: 'notes',
                title: 'הערות',
                wide: true,
                multiline: true
              }]}
              data={data}
              isNew={this.isNew}
              allowAdd={this.isLastInDay}
              preventEdit={this.isEmpty}
              onSave={this.saveReport}
              onDelete={this.deleteReport}
              onAdd={this.addAfter}
            />
          </Paper>
        )}
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(TimeTracking);

function getUserMonths(user) {
  const lastDate = new Date()
  lastDate.setUTCMonth(lastDate.getUTCMonth() + EXTRA_MONTHS)
  const startDate = new Date(user.startDate)
  const firstMonth = startDate.getUTCMonth()+1
  const firstYear = startDate.getUTCFullYear()
  const lastMonth = lastDate.getUTCMonth()+1
  const lastYear = lastDate.getUTCFullYear()
  const ret = []
  for (let year = firstYear; year <= lastYear; year++) {
    for (
      let month = (year === firstYear) ? firstMonth : 1;
      month <= ((year === lastYear) ? lastMonth : 12);
      month++
    ) {
      const m = moment.utc({year, month: month-1})
      ret.push({
        year,
        month,
        numberOfDays: m.numberOfDays,
        display: m.format('YYYY MMMM')
      })
    }
  }
  return ret
}
