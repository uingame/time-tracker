import React from 'react'
import {map, sortBy} from 'lodash'
import moment from 'moment'
import memoizeOne from 'memoize-one';
import {Grid, withStyles, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, TableFooter, TableSortLabel} from '@material-ui/core';
import MultipleSelection from 'common/MultipleSelection'
import ActivityIndicator from 'common/ActivityIndicator'

import {getAllUsers} from 'core/usersService'
import {getReports, getFirstActivityDate} from 'core/reportsService'
import {generateUsersReportCSV} from 'core/csvGenerator'

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

class UsersReport extends React.Component {

  state = {
    loading: true,
    startDate: '',
    users: [],
    usersFilter: [],
    months: [],
    reportsByUser: {},
    orderBy: '',
    orderDirection: 'asc'
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
      startDate: months[months.length-1],
      loading: false
    })

    this.load()
  }

  async load() {
    const {startDate, usersFilter} = this.state
    this.setState({loading: true})
    const endDate = moment.utc(startDate.date).add(1, 'months').toISOString()
    const reportsByUser = await getReports(startDate.date, endDate, 'user', {
      users: usersFilter.map(user => user._id),
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

  downloadCSV() {
    const {reportsByUser, startDate, usersFilter} = this.state
    const basename = usersFilter.length !== 1 ? 'users' : usersFilter[0].displayName.replace(/ /g, '-')
    const timestamp = moment(startDate.date).format('YYYY-MM')
    generateUsersReportCSV(reportsByUser, `${basename}-${timestamp}.csv`)
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
    const {loading, months, startDate, reportsByUser, users, usersFilter, orderBy, orderDirection} = this.state
    return (
      <Grid container direction='column'>
        <Grid container spacing={8} justify='space-evenly'>
          <Grid item xs={4}>
            <MultipleSelection
              label='חודש'
              single={true}
              disabled={loading}
              value={startDate}
              onChange={value => this.updateFilter('startDate', value)}
              data={months}
              displayField='display'
              keyField='date'
            />
          </Grid>
          <Grid item xs={4}>
            <MultipleSelection
              label='עובדים'
              disabled={loading}
              value={usersFilter}
              onChange={value => this.updateFilter('usersFilter', value)}
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
          <Grid item xs={1}>
            <Button
              color='primary'
              variant='contained'
              disabled={loading || !startDate}
              onClick={this.downloadCSV}
            >
              CSV
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
                        <HeaderCell field='date' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>תאריך</HeaderCell>
                        <HeaderCell field='weekday' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>יום</HeaderCell>
                        <HeaderCell field='startTime' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>זמן התחלה</HeaderCell>
                        <HeaderCell field='endTime' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>זמן סיום</HeaderCell>
                        <HeaderCell field='duration' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>מס שעות</HeaderCell>
                        <HeaderCell field='clientName' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>לקוח</HeaderCell>
                        <HeaderCell field='activityName' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>פעילות</HeaderCell>
                        <HeaderCell field='notes' selectedField={orderBy} selectedDirection={orderDirection} onClick={this.applySort}>הערות</HeaderCell>
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
