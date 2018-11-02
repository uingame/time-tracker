import React from 'react'
import {sortBy} from 'lodash'
import moment from 'moment'
import memoizeOne from 'memoize-one';
import { Grid, withStyles, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel } from '@material-ui/core';
import TextField from 'common/TextField'
import MultipleSelection from 'common/MultipleSelection'
import ActivityIndicator from 'common/ActivityIndicator'

import {getAllClients} from 'core/clientsService'
import {getAllUsers} from 'core/usersService'
import {getAllActivities} from 'core/activitiesService'
import {getReports} from 'core/reportsService'
import {generateAdvancedReportCSV} from 'core/csvGenerator'

const styles = theme => ({
  cell: {
    fontSize: '1.25rem',
    textAlign: 'right',
    padding: theme.spacing.unit * 1.5
  }
})

const getSortedData = memoizeOne((reports = [], orderBy, orderDirection) => {
  if (!orderBy) {
    return reports
  }

  const _orderBy = orderBy !== 'weekday' ? orderBy : ({date}) => ((moment(date).day()+1)%7)

  const sortedData = sortBy(reports, _orderBy)
  if (orderDirection === 'desc') {
    sortedData.reverse()
  }
  return sortedData
})

const HeaderCell = withStyles(styles)(({classes, field, selectedField, selectedDirection, onClick, children}) => (
  <TableCell className={classes.cell}>
    <TableSortLabel
      active={selectedField === field}
      direction={selectedDirection}
      onClick={() => onClick && onClick(field)}
    >
      {children}
    </TableSortLabel>
  </TableCell>
))


class AdvancedReport extends React.Component {

  state = {
    startDate: '',
    endDate: '',
    loading: true,
    clients: [],
    clientsFilter: [],
    activities: [],
    activitiesFilter: [],
    users: [],
    usersFilter: [],
    reports: [],
    orderBy: '',
    orderDirection: 'asc'
  }

  constructor(props) {
    super(props)
    this.init()
  }

  async init() {
    const [clients, users, activities] = await Promise.all([
      getAllClients(),
      getAllUsers(),
      getAllActivities()
    ])

    this.setState({
      clients,
      users,
      activities,
      loading: false
    })
  }

  async load() {
    const {startDate, endDate, clientsFilter, usersFilter, activitiesFilter} = this.state
    this.setState({loading: true})
    const reports = await getReports(startDate, endDate, null, {
      clients: clientsFilter.map(client => client._id),
      users: usersFilter.map(user => user._id),
      activities: activitiesFilter.map(activity => activity._id)
    })
    this.setState({
      loading: false,
      reports
    })
  }

  updateFilter(key, val) {
    this.setState({
      [key]: val
    })
  }

  downloadCSV() {
    const {reports, startDate, endDate, clientsFilter, usersFilter, activitiesFilter} = this.state
    const timestamp = `${moment(startDate).format('YYYY-MM-DD')}-${moment(endDate).format('YYYY-MM-DD')}`
    let basename = ''
    if (clientsFilter.length === 1) {
      basename += clientsFilter[0].name.replace(/ /g, '-') + '-'
    }
    if (usersFilter.length === 1) {
      basename += usersFilter[0].displayName.replace(/ /g, '-') + '-'
    }
    if (activitiesFilter.length === 1) {
      basename += activitiesFilter[0].name.replace(/ /g, '-') + '-'
    }
    if (!basename) {
      basename = 'report-'
    }
    generateAdvancedReportCSV(reports, `${basename}${timestamp}.csv`)
  }

  applySort(key) {
    const {orderBy, orderDirection} = this.state
    if (orderBy !== key) {
      this.setState({
        orderBy: key,
        orderDirection: 'asc'
      })
      return
    }

    this.setState({
      orderDirection: orderDirection === 'asc' ? 'desc' : 'asc'
    })
  }

  render() {
    const {classes} = this.props
    const {loading, reports, startDate, endDate, clients, clientsFilter, activities, activitiesFilter, users, usersFilter, orderBy, orderDirection} = this.state
    return (
      <Grid container direction='column'>
        <Grid container spacing={0} justify='space-evenly'>
          <Grid item xs={1}>
            <TextField
              fullWidth={true}
              label='התחלה'
              type='date'
              value={startDate}
              onChange={e => this.updateFilter('startDate', e.target.value)}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth={true}
              label='סיום'
              type='date'
              value={endDate}
              onChange={e => this.updateFilter('endDate', e.target.value)}
            />
          </Grid>
          <Grid item xs={3}>
            <MultipleSelection
              label='לקוחות'
              disabled={loading}
              value={clientsFilter}
              onChange={value => this.updateFilter('clientsFilter', value)}
              data={clients}
              displayField='name'
            />
          </Grid>
          <Grid item xs={3}>
            <MultipleSelection
              label='פעילויות'
              disabled={loading}
              value={activitiesFilter}
              onChange={value => this.updateFilter('activitiesFilter', value)}
              data={activities}
              displayField='name'
            />
          </Grid>
          <Grid item xs={2}>
            <MultipleSelection
              label='עובדים'
              disabled={loading}
              value={usersFilter}
              onChange={value => this.updateFilter('usersFilter', value)}
              data={users}
              displayField='displayName'
            />
          </Grid>
          <Grid container justify='space-between' xs={1}>
            <Grid item>
              <Button
                color='primary'
                variant='contained'
                disabled={loading || !startDate || !endDate}
                onClick={this.load}
              >
                הצג
              </Button>
            </Grid>
            <Grid item>
              <Button
                color='primary'
                variant='contained'
                disabled={loading || !startDate || !endDate}
                onClick={this.downloadCSV}
              >
                CSV
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {loading ? <ActivityIndicator /> : (reports.length > 0 &&
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <HeaderCell field='date' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>תאריך</HeaderCell>
                    <HeaderCell field='weekday' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>יום</HeaderCell>
                    <HeaderCell field='startTime' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>זמן התחלה</HeaderCell>
                    <HeaderCell field='endTime' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>זמן סיום</HeaderCell>
                    <HeaderCell field='duration' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>מס שעות</HeaderCell>
                    <HeaderCell field='clientName' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>לקוח</HeaderCell>
                    <HeaderCell field='username' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>עובד</HeaderCell>
                    <HeaderCell field='activityName' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>פעילות</HeaderCell>
                    <HeaderCell field='notes' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>הערות</HeaderCell>
                    <HeaderCell field='modifiedAt' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>זמן עדכון</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getSortedData(reports, orderBy, orderDirection).map(report => {
                    const m = moment(report.date)
                    return (
                      <TableRow key={report._id}>
                        <TableCell className={classes.cell}>{m.format('D/MM/YYYY')}</TableCell>
                        <TableCell className={classes.cell}>{m.format('dddd')}</TableCell>
                        <TableCell className={classes.cell}>{report.startTime}</TableCell>
                        <TableCell className={classes.cell}>{report.endTime}</TableCell>
                        <TableCell className={classes.cell}>{report.duration}</TableCell>
                        <TableCell className={classes.cell}>{report.clientName}</TableCell>
                        <TableCell className={classes.cell}>{report.username}</TableCell>
                        <TableCell className={classes.cell}>{report.activityName}</TableCell>
                        <TableCell className={classes.cell}>{report.notes}</TableCell>
                        <TableCell className={classes.cell}>{moment(report.modifiedAt).format('HH:mm D/MM/YYYY')}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(AdvancedReport)
