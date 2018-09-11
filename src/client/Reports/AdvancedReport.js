import React from 'react'
import moment from 'moment'
import { Grid, withStyles, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import TextField from 'common/TextField'
import MultipleSelection from 'common/MultipleSelection'
import ActivityIndicator from 'common/ActivityIndicator'

import {getAllClients} from 'core/clientsService'
import {getAllUsers} from 'core/usersService'
import {getAllActivities} from 'core/activitiesService'
import {getReports} from 'core/reportsService'

const styles = theme => ({
  cell: {
    fontSize: '1.25rem',
    textAlign: 'right',
    padding: theme.spacing.unit * 1.5
  }
})

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
    reports: []
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
      clients: clientsFilter,
      users: usersFilter,
      activities: activitiesFilter
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

  render() {
    const {classes} = this.props
    const {loading, reports, startDate, endDate, clients, clientsFilter, activities, activitiesFilter, users, usersFilter} = this.state
    return (
      <Grid container direction='column'>
        <Grid container spacing={8} justify='space-evenly'>
          <Grid item xs={2}>
            <TextField
              fullWidth={true}
              label='התחלה'
              type='date'
              value={startDate}
              onChange={e => this.updateFilter('startDate', e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
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
              onChange={e => this.updateFilter('clientsFilter', e.target.value)}
              data={clients}
              displayField='name'
            />
          </Grid>
          <Grid item xs={3}>
            <MultipleSelection
              label='פעילויות'
              disabled={loading}
              value={activitiesFilter}
              onChange={e => this.updateFilter('activitiesFilter', e.target.value)}
              data={activities}
              displayField='name'
            />
          </Grid>
          <Grid item xs={1}>
            <MultipleSelection
              label='עובדים'
              disabled={loading}
              value={usersFilter}
              onChange={e => this.updateFilter('usersFilter', e.target.value)}
              data={users}
              displayField='displayName'
            />
          </Grid>
          <Grid item xs={1}>
            <Button
              color='primary'
              variant='contained'
              disabled={loading || !startDate || !endDate}
              onClick={this.load}
            >
              הצג
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          {loading ? <ActivityIndicator /> : (reports.length > 0 &&
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.cell}>תאריך</TableCell>
                    <TableCell className={classes.cell}>יום</TableCell>
                    <TableCell className={classes.cell}>זמן התחלה</TableCell>
                    <TableCell className={classes.cell}>זמן סיום</TableCell>
                    <TableCell className={classes.cell}>מס שעות</TableCell>
                    <TableCell className={classes.cell}>לקוח</TableCell>
                    <TableCell className={classes.cell}>עובד</TableCell>
                    <TableCell className={classes.cell}>פעילות</TableCell>
                    <TableCell className={classes.cell}>הערות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map(report => {
                    const m = moment(report.date)
                    return (
                      <TableRow>
                        <TableCell className={classes.cell}>{m.format('D/MM/YYYY')}</TableCell>
                        <TableCell className={classes.cell}>{m.format('dddd')}</TableCell>
                        <TableCell className={classes.cell}>{report.startTime}</TableCell>
                        <TableCell className={classes.cell}>{report.endTime}</TableCell>
                        <TableCell className={classes.cell}>{report.duration}</TableCell>
                        <TableCell className={classes.cell}>{report.clientName}</TableCell>
                        <TableCell className={classes.cell}>{report.username}</TableCell>
                        <TableCell className={classes.cell}>{report.activityName}</TableCell>
                        <TableCell className={classes.cell}>{report.notes}</TableCell>
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
