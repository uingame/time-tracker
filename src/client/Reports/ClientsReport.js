import React from 'react'
import {map, sortBy, get} from 'lodash'
import moment from 'moment'
import memoizeOne from 'memoize-one';
import {Grid, Button, Paper, TableCell, Typography, TableSortLabel} from '@mui/material';
import {withStyles} from '@mui/styles'
import * as timetrackingService from 'core/timetrackingService';
import MultipleSelection from 'common/MultipleSelection'
import ActivityIndicator from 'common/ActivityIndicator'
import EditableTable from '../common/EditableTable'
import { getAllActivities } from 'core/activitiesService'
import { getAllUsers } from 'core/usersService'
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
    lineHeight: '3rem',
    fontSize: '1.2rem',
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

const NEW_PREFIX = 'new_';
let dummyIdCounter = 0;

class ClientsReport extends React.Component {

  state = {
    loading: true,
    startDate: '',
    clients: [],
    clientsFilter: [],
    users: [],
    activities: [],
    months: [],
    reportsByClient: {},
    orderBy: '',
    orderDirection: 'asc'
  }

  constructor(props) {
    super(props)
    this.init()
  }

  async init() {
    const [users, clients, firstDate, allActivities] = await Promise.all([
      getAllUsers(),
      getAllClients(),
      getFirstActivityDate(),
      getAllActivities(),
    ])

    const months = makeMonthsList(firstDate)

    this.setState({
      users,
      clients,
      months,
      startDate: months[months.length-1],
      loading: false,
      activities: allActivities,
    }, this.load)
  }

  async load() {
    const {startDate, clientsFilter} = this.state
    this.setState({loading: true})
    const endDate = moment.utc(startDate.date).add(1, 'months').toISOString()
    const reportsByClient = await getReports(startDate.date, endDate, 'client', {
      clients: clientsFilter.map(client => client._id),
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
    const {reportsByClient, startDate, clientsFilter} = this.state
    const basename = clientsFilter.length !== 1 ? 'clients' : clientsFilter[0].name.replace(/ /g, '-')
    const timestamp = moment(startDate.date).format('YYYY-MM')

    generateClientsReportCSV(reportsByClient, `${basename}-${timestamp}.csv`)
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

  getReportWeekday(report) {
    if (!get(report, 'date')) {
      return '';
    }
    try {
      return moment(report.date).format('dddd');
    } catch (err) {
      console.error(err);
      return '';
    }
  }

  async saveReport(report) {
    console.log('start saveReport')
    const { _id, ...reportData } = report;

    const isNew = report._id.startsWith(NEW_PREFIX);

    console.log('isNew', isNew)

    const updatedReport = isNew
      ? await timetrackingService.addTimeTrackingReport(reportData)
      : await timetrackingService.updateTimeTrackingReport(_id, reportData);

    this.setState(prevState => {
      const updatedClientReports = prevState.reportsByClient[updatedReport.clientId].reports.map(r => r._id === _id ? updatedReport : r);

      const updatedReportsByClient = {
        ...prevState.reportsByClient,
        [updatedReport.clientId]: {
          ...prevState.reportsByClient[updatedReport.clientId],
          reports: [...updatedClientReports],
          totalHours: updatedClientReports.reduce((sum, r) => sum + r.duration, 0)
        }
      };

      return {
        ...prevState,
        reportsByClient: updatedReportsByClient
      };
    });
  }

  async deleteReport(report) {
    await timetrackingService.deleteTimeTrackingReport(report._id);

    this.setState(prevState => {
      const updatedClientReports = prevState.reportsByClient[report.clientId].reports.filter(r => r._id !== report._id);

      const updatedReportsByClient = {
        ...prevState.reportsByClient,
        [report.clientId]: {
          ...prevState.reportsByClient[report.clientId],
          reports: updatedClientReports,
          totalHours: updatedClientReports.reduce((sum, r) => sum + r.duration, 0)
        }
      };

      return {
        ...prevState,
        reportsByClient: updatedReportsByClient
      };
    });
  }

  async duplicateReport(report) {
    // Clone the report and assign a new unique ID with NEW_PREFIX
    const newId = NEW_PREFIX + (dummyIdCounter++);
    const clonedReport = {
      ...report,
      _id: newId
    };

    this.setState(prevState => {
      const clientReports = prevState.reportsByClient[report.clientId].reports;
      const reportIndex = clientReports.findIndex(r => r._id === report._id);

      // Insert the cloned report at the next index
      const updatedClientReports = [
        ...clientReports.slice(0, reportIndex + 1),
        clonedReport,
        ...clientReports.slice(reportIndex + 1)
      ];

      const updatedReportsByClient = {
        ...prevState.reportsByClient,
        [report.clientId]: {
          ...prevState.reportsByClient[report.clientId],
          reports: updatedClientReports,
          totalHours: updatedClientReports.reduce((sum, r) => sum + r.duration, 0)
        }
      };

      return {
        ...prevState,
        reportsByClient: updatedReportsByClient
      };
    });
  }


  render() {
    const {classes} = this.props
    const {loading, months, startDate, reportsByClient, users, clients, activities, clientsFilter, orderBy, orderDirection} = this.state
    return (
      <Grid container direction='column' padding={1}>
        <Grid container justify='space-between'>
          <Grid container xs={10} item gap={1}>
            <Grid item xs={2}>
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
            <Grid item xs={8}>
              <MultipleSelection
                label='לקוחות'
                disabled={loading}
                value={clientsFilter}
                onChange={value => this.updateFilter('clientsFilter', value)}
                data={clients}
                displayField='name'
              />
            </Grid>
          </Grid>
          <Grid container item xs={2} justifyContent='flex-end' alignItems='center'>
            <Grid item xs={4}>
              <Button
                color='primary'
                variant='contained'
                disabled={loading || !startDate}
                onClick={this.load}
              >
                הצג
              </Button>
            </Grid>
            <Grid item xs={4}>
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
        </Grid>
        <Grid item>
          {loading ? <ActivityIndicator /> : map(reportsByClient,
            ({reports, totalHours, numberOfWorkdays}, clientId) => (
              <React.Fragment key={clientId}>
                <Typography variant='title' gutterBottom className={classes.title}>
                  {reports[0] ? reports[0].clientName : ''}
                </Typography>
                <Paper className={classes.tableContainer}>
                  <EditableTable
                    data={getSortedData(reports, orderBy, orderDirection)}
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
                      title: 'מס שעות',
                      type: 'number',
                      sortable: true
                    },    {
                      id: 'userId',
                      title: 'עובד',
                      select: users,
                      idField: '_id',
                      displayField: 'displayName',
                      sortable: true
                    }, {
                      id: 'activityId',
                      title: 'פעילות',
                      select: activities,
                      idField: '_id',
                      displayField: 'name',
                      sortable: true
                    }, {
                      id: 'notes',
                      title: 'הערות',
                      multiline: true,
                      wide: true
                    }, {
                      id: 'modifiedAt',
                      title: 'זמן עדכון',
                      type: 'computed',
                      transform: ({modifiedAt}) => moment(modifiedAt).format('HH:mm D/MM/YYYY'),
                      sortable: true
                    }]}
                    onSave={this.saveReport}
                    onDelete={this.deleteReport}
                    onDuplicate={this.duplicateReport}
                    footerData={[{
                      cells: [
                        {},
                        {},
                        {},
                        { content: 'שעות עבודה' },
                        { content: totalHours },
                        {},
                        {},
                        {},
                        {},
                        {},
                      ]
                    }, {
                      cells: [
                        {},
                        {},
                        {},
                        { content: 'ימי עבודה' },
                        { content: numberOfWorkdays },
                        {},
                        {},
                        {},
                        {},
                        {},
                      ]
                    }]}
                  />
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