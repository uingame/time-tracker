import React from 'react'
import PropTypes from 'prop-types'
import {get, without} from 'lodash'
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add'

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
  newIcon: {
    marginLeft: theme.spacing.unit
  },
  fullWidth: {
    width: '100%'
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
    reports: []
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
    this.initUser(user)
  }

  initUser(user) {
    const months = getUserMonths(user)
    this.setState({
      loading: false,
      months,
      selectedUser: user
    })
    this.initMonth(months[months.length-1-EXTRA_MONTHS], user)
  }

  selectUser(e) {
    const userId = get(e, 'target.value', e)
    this.initUser(this.state.users.find(({_id}) => _id === userId))
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
    const newReport =         {
      _id: NEW_PREFIX + (dummyIdCouter++),
      date: '',
      startTime: '',
      endTime: '',
      duration: '',
      clientId: '',
      activityId: '',
      notes: '',
    }
    if (this.state.isAdmin && this.state.selectedUser) {
      newReport.userId = this.state.selectedUser._id
    }
    this.setState({
      reports: [
        newReport,
        ...this.state.reports
      ]
    })
  }

  duplicate(report) {
    const {reports} = this.state
    const idx = reports.indexOf(({_id}) => _id === report._id)
    this.setState({
      reports: [
        ...this.state.reports.slice(0, idx),
        {
          ...report,
          _id: NEW_PREFIX + (dummyIdCouter++)
        },
        ...this.state.reports.slice(idx)
      ]
    })
  }

  async saveReport(report) {
    const {_id, ...reportData} = report
    const isNew = this.isNew(report)
    const updatedReport = isNew ?
      await timetrackingService.addTimeTrackingReport(reportData) :
      await timetrackingService.updateTimeTrackingReport(_id, reportData)

    const {reports} = this.state
    const idx = reports.findIndex(r => r._id === _id)
    this.setState({
      reports : [
        ...reports.slice(0, idx),
        updatedReport,
        ...reports.slice(idx+1)
      ]
    })
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
            {selectedMonth && !selectedMonth.locked && (
              <Button onClick={this.addNewReport} variant="contained" color="primary">
                <AddIcon className={classes.newIcon}/>
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
                  focus: true
                }, {
                  id: 'weekday',
                  title: 'יום',
                  type: 'computed',
                  transform: this.getReportWeekday
                }, {
                  id: 'startTime',
                  title: 'זמן התחלה',
                  type: 'time',
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

function getUserMonths(user) {
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
        locked: m.isBefore(firstUnlockedDate)
      })
    }
  }
  return ret
}
