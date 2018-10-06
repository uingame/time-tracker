import React from 'react'
import {map} from 'lodash'
import moment from 'moment'
import {Grid, withStyles, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, TableFooter, Tab} from '@material-ui/core';
import MultipleSelection from 'common/MultipleSelection'
import ActivityIndicator from 'common/ActivityIndicator'

import {getAllClients} from 'core/clientsService'
import {getReports, getFirstActivityDate} from 'core/reportsService'
import {generateClientsReportCSV} from 'core/csvGenerator'

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

class ClientsReport extends React.Component {

  state = {
    loading: true,
    startDate: '',
    clients: [],
    clientsFilter: [],
    months: [],
    reportsByClient: {}
  }

  constructor(props) {
    super(props)
    this.init()
  }

  async init() {
    const [clients, firstDate] = await Promise.all([
      getAllClients(),
      getFirstActivityDate()
    ])

    const months = makeMonthsList(firstDate)

    this.setState({
      clients,
      months,
      startDate: months[months.length-1].date,
      loading: false
    })

    this.load()
  }

  async load() {
    const {startDate, clientsFilter} = this.state
    this.setState({loading: true})
    const endDate = moment.utc(startDate).add(1, 'months').toISOString()
    const reportsByClient = await getReports(startDate, endDate, 'client', {
      clients: clientsFilter,
    })
    this.setState({
      loading: false,
      reportsByClient
    })
  }

  updateFilter(key, val) {
    this.setState({
      [key]: val
    })
  }

  downloadCSV() {
    const {reportsByClient, startDate, clientsFilter, clients} = this.state
    const basename = clientsFilter.length !== 1 ? 'clients' : clients.find(({_id}) => _id === clientsFilter[0]).name.replace(/ /g, '-')
    const timestamp = moment(startDate).format('YYYY-MM')
    generateClientsReportCSV(reportsByClient, `${basename}-${timestamp}.csv`)
  }

  render() {
    const {classes} = this.props
    const {loading, months, startDate, reportsByClient, clients, clientsFilter} = this.state
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
              label='לקוחות'
              disabled={loading}
              value={clientsFilter}
              onChange={e => this.updateFilter('clientsFilter', e.target.value)}
              data={clients}
              displayField='name'
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
          {loading ? <ActivityIndicator /> : map(reportsByClient,
            ({reports, totalHours, totalPrice}, clientId) => (
              <React.Fragment key={clientId}>
                <Typography variant='title' gutterBottom className={classes.title}>
                  {reports[0].clientName}
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
                        <TableCell className={classes.cell}>עובד</TableCell>
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
                            <TableCell className={classes.cell}>{report.username}</TableCell>
                            <TableCell className={classes.cell}>{report.activityName}</TableCell>
                            <TableCell className={classes.cell}>{report.notes}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className={classes.cell} colSpan={4}>
                          סה״כ לתשלום: {totalPrice}₪
                        </TableCell>
                        <TableCell className={classes.cell}>
                          {totalHours}
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

export default withStyles(styles)(ClientsReport)

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
