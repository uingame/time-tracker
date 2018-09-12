import React from 'react'
import {map} from 'lodash'
import moment from 'moment'
import {Grid, withStyles, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, TableFooter, Tab} from '@material-ui/core';
import MultipleSelection from 'common/MultipleSelection'
import ActivityIndicator from 'common/ActivityIndicator'

import {getAllUsers} from 'core/usersService'
import {getReports, getFirstActivityDate} from 'core/reportsService'

const styles = theme => ({
  cell: {
    fontSize: '1.25rem',
    textAlign: 'right',
    padding: theme.spacing.unit * 1.5
  },
  title: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit
  }
})

class UsersReport extends React.Component {

  state = {
    loading: true,
    startDate: '',
    users: [],
    usersFilter: [],
    months: [],
    reportsByUser: {}
  }

  constructor(props) {
    super(props)
    this.init()
  }

  async init() {
    const [users, firstDate] = await Promise.all([
      getAllUsers(),
      getFirstActivityDate()
    ])

    const months = makeMonthsList(firstDate)

    this.setState({
      users,
      months,
      startDate: months[months.length-1].date,
      loading: false
    })

    this.load()
  }

  async load() {
    const {startDate, usersFilter} = this.state
    this.setState({loading: true})
    const endDate = moment.utc(startDate).add(1, 'months').toISOString()
    const reportsByUser = await getReports(startDate, endDate, 'user', {
      users: usersFilter,
    })
    this.setState({
      loading: false,
      reportsByUser
    })
  }

  updateFilter(key, val) {
    this.setState({
      [key]: val
    })
  }

  render() {
    const {classes} = this.props
    const {loading, months, startDate, reportsByUser, users, usersFilter} = this.state
    return (
      <Grid container direction='column'>
        <Grid container spacing={8} justify='space-evenly'>
          <Grid item xs={2}>
            <MultipleSelection
              label='חודש'
              single={true}
              disabled={loading}
              value={startDate}
              onChange={e => this.updateFilter('startDate', e.target.value)}
              data={months}
              displayField='display'
              keyField='date'
            />
          </Grid>
          <Grid item xs={3}>
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
              disabled={loading || !startDate}
              onClick={this.load}
            >
              הצג
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          {loading ? <ActivityIndicator /> : map(reportsByUser,
            ({reports, totalHours, numberOfWorkdays, salary, travelSalary, totalSalary}, clientId) => (
              <React.Fragment key={clientId}>
                <Typography variant='title' gutterBottom className={classes.title}>
                  {reports[0].username}
                </Typography>
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
                        <TableCell className={classes.cell}>פעילות</TableCell>
                        <TableCell className={classes.cell}>הערות</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.map(report => {
                        const m = moment(report.date)
                        return (
                          <TableRow key={report._id}>
                            <TableCell className={classes.cell}>{m.format('D/MM/YYYY')}</TableCell>
                            <TableCell className={classes.cell}>{m.format('dddd')}</TableCell>
                            <TableCell className={classes.cell}>{report.startTime}</TableCell>
                            <TableCell className={classes.cell}>{report.endTime}</TableCell>
                            <TableCell className={classes.cell}>{report.duration}</TableCell>
                            <TableCell className={classes.cell}>{report.clientName}</TableCell>
                            <TableCell className={classes.cell}>{report.activityName}</TableCell>
                            <TableCell className={classes.cell}>{report.notes}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className={classes.cell}>
                          שכר
                        </TableCell>
                        <TableCell className={classes.cell} colSpan={2}>
                          {salary}₪
                        </TableCell>
                        <TableCell className={classes.cell}>
                          שעות עבודה
                        </TableCell>
                        <TableCell className={classes.cell}>
                          {totalHours}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.cell}>
                          נסיעות
                        </TableCell>
                        <TableCell className={classes.cell} colSpan={2}>
                          {travelSalary}₪
                        </TableCell>
                        <TableCell className={classes.cell}>
                          ימי עבודה
                        </TableCell>
                        <TableCell className={classes.cell}>
                          {numberOfWorkdays}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.cell}>
                          סה״כ
                        </TableCell>
                        <TableCell className={classes.cell}>
                          {totalSalary}₪
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </Paper>
              </React.Fragment>
            )
          )}
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(UsersReport)

function makeMonthsList(firstDate) {
  const now = moment.utc()
  let m = moment.utc(firstDate).date(1)
  const ret = []
  while (m.isSameOrBefore(now)) {
    ret.push({
      date: m.toISOString(),
      display: m.format('YYYY MMMM')
    })
    m = m.add(1, 'months')
  }
  return ret
}
