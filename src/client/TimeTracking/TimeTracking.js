import React from 'react'
import PropTypes from 'prop-types'
import {get, without, omit} from 'lodash'
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add'
import DownloadIcon from '@material-ui/icons/GetApp'

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import ActivityIndicator from 'common/ActivityIndicator'

import {getSignedInUser} from 'core/authService'
import * as timetrackingService from 'core/timetrackingService'
import {getAllActivities} from 'core/activitiesService'
import {getAllClients} from 'core/clientsService'
import {getAllUsers} from 'core/usersService'

import moment from 'moment'
import EditableTable from '../common/EditableTable';

import {generateTimeTrackingCSV} from 'core/csvGenerator'

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
    direction: 'rtl',
    marginLeft: theme.spacing.unit
  },
  iconInButton: {
    marginLeft: theme.spacing.unit
  },
  fullWidth: {
    width: '100%'
  },
  csvButton: {
    marginLeft: theme.spacing.unit,
  }
});

let dummyIdCouter = 0

class TimeTracking extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
  }

  state = {
    isAdmin: false,
    loading: true,
    loadingMonth: false,
    clients: [],
    activities: [],
    selectedMonth: null,
    reports: [],
    duplications: {}
  }

  constructor(props) {
    super(props)
    this.init()
  }

  async init() {
    const [clients, allActivities] = await Promise.all([
      getAllClients(),
      getAllActivities()
    ])
    const user = getSignedInUser()
    const users = !user.isAdmin ? null : await getAllUsers()
    this.setState({
      isAdmin: user.isAdmin,
      clients,
      activities: clients.reduce((ret, client) => {
        ret[client._id] = allActivities
          .filter(activity => client.activities.some(({activityId}) => activityId === activity._id))
        return ret
      }, {}),
      users
    })
    this.initUser(user, user.isAdmin)
  }

  initUser(user, disableLock) {
    const months = getUserMonths(user, disableLock)
    this.setState({
      loading: false,
      months,
      selectedUser: user
    })
    this.initMonth(months[months.length-1-EXTRA_MONTHS], user)
  }

  selectUser(e) {
    const userId = get(e, 'target.value', e)
    this.initUser(this.state.users.find(({_id}) => _id === userId), true)
  }

  selectMonth(e) {
    const idx = get(e, 'target.value', e)
    this.initMonth(this.state.months[idx], this.state.selectedUser)
  }

  async initMonth(selectedMonth, selectedUser) {
    this.setState({
      selectedMonth,
      loadingMonth: true
    })
    const reports = await timetrackingService.getMonthTimeTracking(selectedMonth.month, selectedMonth.year, this.state.isAdmin && selectedUser)
    this.setState({
      loadingMonth: false,
      reports
    })
  }

  isEmpty(report) {
    return report._id.startsWith(EMPTY_PREFIX)
  }

  shouldPreventEdit(report) {
    return this.state.selectedMonth.locked || this.isEmpty(report)
  }

  isNew(report) {
    return report._id.startsWith(NEW_PREFIX)
  }

  addNewReport() {
    const {selectedMonth: {month, year}, selectedUser, isAdmin, reports} = this.state

    const now = moment()
    const day = (now.month()+1 === month && now.year() === year) ? now.date() : undefined

    const newReport =         {
      _id: NEW_PREFIX + (dummyIdCouter++),
      date: moment.utc({day, month: month-1, year}).toISOString().split('T', 1)[0],
      startTime: '',
      endTime: '',
      duration: '',
      clientId: '',
      activityId: '',
      notes: '',
    }
    if (isAdmin && selectedUser) {
      newReport.userId = selectedUser._id
    }
    this.setState({
      reports: [
        newReport,
        ...reports
      ]
    })
  }

  duplicate(report) {
    const {reports} = this.state
    const idx = reports.indexOf(({_id}) => _id === report._id)
    const newId = NEW_PREFIX + (dummyIdCouter++)
    this.setState({
      duplications: {
        ...this.state.duplications,
        [newId]: report
      },
      reports: [
        ...this.state.reports.slice(0, idx),
        {
          ...report,
          _id: newId
        },
        ...this.state.reports.slice(idx)
      ]
    })
  }

  async saveReport(report) {
    const {_id, ...reportData} = report
    const isNew = this.isNew(report)
    if (isNew) this._validateDuplications(report)
    const updatedReport = isNew ?
      await timetrackingService.addTimeTrackingReport(reportData) :
      await timetrackingService.updateTimeTrackingReport(_id, reportData)

    const {reports} = this.state
    const idx = reports.findIndex(r => r._id === _id)
    this.setState({
      duplications: omit(this.state.duplications, report._id),
      reports : [
        ...reports.slice(0, idx),
        updatedReport,
        ...reports.slice(idx+1)
      ]
    })
  }

  _validateDuplications(report) {
    const original = this.state.duplications[report._id]
    if (!original) {
      return
    }

    if (original.date === report.date && original.startTime === report.startTime && original.endTime === report.endTime) {
      alert('אנא שנה תאריך/זמן התחלה/זמן סיום')
      throw new Error('Duplication without change')
    }
  }

  async deleteReport(report) {
    const isNew = this.isNew(report)
    if (!isNew) {
      await timetrackingService.deleteTimeTrackingReport(report._id)
    }

    this.setState({
      reports: without(this.state.reports, report)
    })
  }

  getReportWeekday(report) {
    if (!get(report, 'date')) {
      return ''
    }
    try {
      return moment(report.date).format('dddd')
    } catch (err) {
      console.error(err)
      return ''
    }
  }

  downloadCSV() {
    const {reports, selectedMonth: {month, year}} = this.state
    generateTimeTrackingCSV(reports, `report-${year}-${month}.csv`)
  }

  render() {
    const {classes} = this.props
    const {loading, loadingMonth, months, selectedMonth, clients, activities, users, selectedUser, reports, isAdmin} = this.state

    if (loading) {
      return <ActivityIndicator />
    }

    return (
      <Grid container>
        <Grid container justify='space-between'>
          <Grid item>
            {isAdmin && <Select
              className={classes.input}
              value={selectedUser && selectedUser._id}
              onChange={this.selectUser}
            >
              {users.map(({_id, displayName}) => (
                <MenuItem key={_id} value={_id}>{displayName}</MenuItem>
              ))}
            </Select>}
            <Select
              className={classes.input}
              value={months.indexOf(selectedMonth)}
              onChange={this.selectMonth}
            >
              {months.map((month, idx) => (
                <MenuItem key={idx} value={idx}>{month.display}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            {selectedMonth && (
              <Button className={classes.csvButton} onClick={this.downloadCSV} variant="contained" color="primary">
                <DownloadIcon className={classes.iconInButton}/>
                CSV
              </Button>
            )}
            {selectedMonth && !selectedMonth.locked && (
              <Button onClick={this.addNewReport} variant="contained" color="primary">
                <AddIcon className={classes.iconInButton}/>
                דיווח חדש
              </Button>
            )}
          </Grid>
        </Grid>
        <Grid item className={classes.fullWidth}>
          {loadingMonth ? <ActivityIndicator /> : (
            <Paper className={classes.root}>
              <EditableTable
                headers={[{
                  id: 'date',
                  title: 'תאריך',
                  type: 'date',
                  focus: true,
                  sortable: true
                }, {
                  id: 'weekday',
                  title: 'יום',
                  type: 'computed',
                  transform: this.getReportWeekday,
                  sortable: true
                }, {
                  id: 'startTime',
                  title: 'זמן התחלה',
                  type: 'time',
                  sortable: true
                }, {
                  id: 'endTime',
                  title: 'זמן סיום',
                  type: 'time',
                  sortable: true
                }, {
                  id: 'duration',
                  type: 'number',
                  title: 'מס שעות',
                  sortable: true
                }, {
                  id: 'clientId',
                  title: 'לקוח',
                  select: clients,
                  idField: '_id',
                  displayField: 'name',
                  sortable: true
                }, {
                  id: 'activityId',
                  title: 'פעילות',
                  select: ({clientId}) => activities[clientId],
                  idField: '_id',
                  displayField: 'name',
                  sortable: true
                }, {
                  id: 'notes',
                  title: 'הערות',
                  wide: true,
                  multiline: true
                }]}
                data={reports}
                isNew={this.isNew}
                preventEdit={this.shouldPreventEdit}
                onSave={this.saveReport}
                onDelete={this.deleteReport}
                onDuplicate={this.duplicate}
              />
            </Paper>
          )}
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(TimeTracking);

function getUserMonths(user, disableLock) {
  let firstUnlockedDate = moment.utc({day: 1})
  if (moment.utc().date() <= user.lastReportDay) {
    firstUnlockedDate = firstUnlockedDate.add(-1, 'months')
  }
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
        display: m.format('YYYY MMMM'),
        locked: !disableLock && m.isBefore(firstUnlockedDate)
      })
    }
  }
  return ret
}
