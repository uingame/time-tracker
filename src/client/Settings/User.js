import React from 'react'
import PropTypes from 'prop-types'
import {get, uniq} from 'lodash'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import IconButton from '@material-ui/core/IconButton'
import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'

import TextField from 'common/TextField'
import ActivityIndicator from 'common/ActivityIndicator'
import MultipleSelection from 'common/MultipleSelection'

import * as usersService from 'core/usersService'
import { MenuItem } from '@material-ui/core';


const styles = theme => ({
  title: {
    padding: theme.spacing.unit * 2,
  },
  table: {
    padding: theme.spacing.unit * 2
  },
  cell: {
    textAlign: 'right'
  }
})

const EMPTY_USER = {
  _id: '',
  username: '',
  password: '',
  isAdmin: false,
  firstName: '',
  lastName: '',
  idNumber: '',
  address: '',
  phone: '',
  email: '',
  startDate: '',

  type: 'employee',
  lastReportDay: 10,

  defaultHourlyQuote: 0,
  defaultTravelQuote: 0,

  activities: []
}

class User extends React.PureComponent {

  static propTypes = {
    classes: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    clients: PropTypes.array.isRequired,
    onUpdate: PropTypes.func.isRequired
  };

  state = {
    loading: true,
    saving: false,
    user: null,
    hasChanges: false,
    errorFields: [],
    selectedClients: []
  }

  constructor(props) {
    super(props)
    if (props.userId == 'new') {
      this.state = {
        ...this.state,
        loading: false,
        user: EMPTY_USER
      }
    } else {
      this.fetchUser(props.userId)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userId !== this.props.userId) {
      if (nextProps.userId === 'new') {
        this.setState({
          ...this.state,
          loading: false,
          saving: false,
          errorFields: [],
          user: EMPTY_USER
        })
      } else {
        this.setState({
          loading: true,
          saving: false,
          errorFields: [],
          user: null
        })
        this.fetchUser(nextProps.userId)
      }
    }
  }


  async fetchUser(userId) {
    const user = await usersService.getUserById(userId)
    this.setState({
      loading: false,
      user: {
        ...EMPTY_USER,
        ...user
      },
      selectedClients: uniq((user.activities || []).map(a => a.clientId))
        .map(clientId => this.props.clients.find(({_id}) => _id === clientId))
    })
  }

  setValue(key, value) {
    this.setState({
      hasChanges: true,
      user: {
        ...this.state.user,
        [key]: value
      }
    })

    if (this.state.errorFields.includes(key)) {
      this.setState({
        errorFields: this.state.errorFields.filter(field => field !== key)
      })
    }
  }

  updateActivities(e) {
    this.setValue('activities', e.target.value.map(id => (
      this.state.user.activities.find(({activityId}) => activityId === id) || {
        activityId: id,
        hourlyQuote: this.props.activities.find(({_id}) => _id === id).defaultHourlyQuote
      }
    )))

    if (this.state.errorFields.find(errField => errField.startsWith('activities'))) {
      this.setState({
        errorFields: this.state.errorFields.filter(field => !field.startsWith('activities'))
      })
    }
  }

  updateSelectedClients(e) {
    const selectedClients = (e.target.value || [])
    this.setState({
      selectedClients: selectedClients
        .map(clientId => this.props.clients.find(({_id}) => _id === clientId))
    })
    if (this.state.user.activities.some(({clientId}) => !selectedClients.includes(clientId))) {
      this.setValue('activities',
        this.state.user.activities.filter(({clientId}) => selectedClients.includes(clientId))
      )
    }
  }

  updateActivityField(activityId, clientId, key, val) {
    const {activities} = this.state.user
    const idx = activities.findIndex(a => a.activityId === activityId && a.clientId === clientId)
    if (idx === -1) {
      return
    }
    this.setValue('activities', [
      ...activities.slice(0, idx),
      {
        ...activities[idx],
        [key]: val
      },
      ...activities.slice(idx+1)
    ])

    const errKey = `activities.${idx}.${key}`
    if (this.state.errorFields.includes(errKey)) {
      this.setState({
        errorFields: this.state.errorFields.filter(field => field !== errKey)
      })
    }
  }

  handleActivityCheckbox(clientId, activityId, checked) {
    if (checked) {
      this.setValue('activities', [
        ...this.state.user.activities,
        {
          clientId,
          activityId
        }
      ])
    } else {
      this.setValue('activities', this.state.user.activities.filter(
        activity => !(activity.clientId === clientId && activity.activityId === activityId)
      ))
    }
  }

  async save() {
    this.setState({
      saving: true,
      errorFields: [],
    })
    const {_id, ...settings} = this.state.user
    try {
      const user = _id ?
        await usersService.updateUser(_id, settings) :
        await usersService.addUser(settings)

      this.setState({
        user: {
          ...EMPTY_USER,
          ...user
        },
        hasChanges: false,
        errorFields: [],
        saving: false
      })
      this.props.onUpdate(user)
    } catch (err) {
      this.setState({
        saving: false
      })
      const fields = get(err, 'response.data.fields')
      if (fields) {
        this.setState({
          errorFields: Object.keys(fields)
        })
      }

    }
  }

  async delete() {
    this.setState({
      saving: true
    })
    const {userId} = this.props
    await usersService.deleteUser(userId)
    this.props.onDelete(userId)
  }

  render() {
    const {classes, clients} = this.props
    const {loading, user, hasChanges, saving, errorFields, selectedClients} = this.state

    if (loading) {
      return <ActivityIndicator />
    }

    return (
      <Grid container direction='column'>
        <Grid container justify='space-between'>
          <Grid item>
            <Typography className={classes.title} variant='title'>
              פרטי עובד
            </Typography>
          </Grid>
          <Grid item>
            {saving && <ActivityIndicator />}
            {!saving && hasChanges && <IconButton onClick={this.save}>
              <SaveIcon />
            </IconButton>}
            {!saving && user._id && <IconButton onClick={this.delete}>
              <DeleteIcon />
            </IconButton>}
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={3}>
            <TextField
              label='מספר עובד'
              value={user._id}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label='ת.ז.'
              value={user.idNumber || ''}
              onChange={e => this.setValue('idNumber', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('idNumber')}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              type='date'
              label='תאריך תחילת עבודה'
              value={getFormattedDate(user.startDate)}
              onChange={e => this.setValue('startDate', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('startDate')}
            />
          </Grid>
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.isAdmin}
                  onChange={(e, checked) => this.setValue('isAdmin', checked)}
                  disabled={saving}
                />
              }
              label="מנהל"
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={3}>
            <TextField
              label='שם פרטי'
              value={user.firstName || ''}
              onChange={e => this.setValue('firstName', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('firstName')}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label='שם משפחה'
              value={user.lastName || ''}
              onChange={e => this.setValue('lastName', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('lastName')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label='טלפון'
              value={user.phone || ''}
              onChange={e => this.setValue('phone', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('phone')}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <TextField
              label='כתובת'
              value={user.address || ''}
              onChange={e => this.setValue('address', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('address')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label='email'
              value={user.email || ''}
              onChange={e => this.setValue('email', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('email')}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <TextField
              label='שם משתמש'
              value={user.username || ''}
              onChange={e => this.setValue('username', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('username')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label='סיסמא'
              value={user.password || ''}
              onChange={e => this.setValue('password', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('password')}
            />
          </Grid>
        </Grid>
        <Grid item>
          <Typography className={classes.title} variant='title'>
            שכר
          </Typography>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <TextField
              label='סוג עובד'
              select
              value={user.type || ''}
              onChange={e => this.setValue('type', e.target.value)}
              disabled={saving}
              error={errorFields.includes('type')}
            >
              <MenuItem value='employee'>שכיר</MenuItem>
              <MenuItem value='contractor'>עצמאי</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={2}>
            <TextField
              label='תעריף שעתי'
              type='number'
              value={user.defaultHourlyQuote || ''}
              onChange={e => this.setValue('defaultHourlyQuote', e.target.value)}
              disabled={saving}
              error={errorFields.includes('defaultHourlyQuote')}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label='תעריף נסיעות'
              type='number'
              value={user.defaultTravelQuote || ''}
              onChange={e => this.setValue('defaultTravelQuote', e.target.value)}
              disabled={saving}
              error={errorFields.includes('defaultTravelQuote')}
            />
          </Grid>
        </Grid>
        <Grid item>
          <Typography className={classes.title} variant='title'>
            פעילויות
          </Typography>
        </Grid>
        <Grid item>
          <MultipleSelection
            label='לקוחות'
            disabled={saving}
            value={selectedClients.map(client => client._id)}
            onChange={this.updateSelectedClients}
            data={clients}
            displayField='name'
          />
        </Grid>
        <Grid item>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cell}>בית ספר</TableCell>
              <TableCell className={classes.cell}>פעילות</TableCell>
              <TableCell className={classes.cell}>מורשה</TableCell>
              <TableCell className={classes.cell}>סוג עובד</TableCell>
              <TableCell className={classes.cell}>תעריף שעתי</TableCell>
              <TableCell className={classes.cell}>תעריף נסיעות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              selectedClients.map(client => (
                <React.Fragment key={client._id}>
                  {client.activities.map((activity, clientIdx) => {
                    const idx = user.activities.findIndex(({activityId, clientId}) => activityId === activity.activityId && clientId === client._id)
                    const userActivity = user.activities[idx]
                    return (
                      <TableRow key={activity.activityId}>
                        <TableCell className={classes.cell}>{clientIdx === 0 ? client.name : ''}</TableCell>
                        <TableCell className={classes.cell}>{activity.name}</TableCell>
                        <TableCell className={classes.cell}>
                          <Checkbox
                            checked={!!userActivity}
                            onChange={(e, checked) => this.handleActivityCheckbox(client._id, activity.activityId, checked)}
                            disabled={saving}
                          />
                        </TableCell>
                        <TableCell className={classes.cell}>
                          {userActivity && <TextField
                            select
                            fullWidth
                            value={userActivity.type || ''}
                            onChange={e => this.updateActivityField(activity.activityId, client._id, 'type', e.target.value)}
                            disabled={saving}
                            error={errorFields.includes('type')}
                          >
                            <MenuItem></MenuItem>
                            <MenuItem value='employee'>שכיר</MenuItem>
                            <MenuItem value='contractor'>עצמאי</MenuItem>
                          </TextField>}
                        </TableCell>
                        <TableCell className={classes.cell}>
                          {userActivity && <TextField
                            type='number'
                            fullWidth
                            value={userActivity.hourlyQuote || ''}
                            placeholder={`${user.defaultHourlyQuote || ''}`}
                            onChange={e => this.updateActivityField(activity.activityId, client._id, 'hourlyQuote', e.target.value)}
                            disabled={saving}
                            error={errorFields.includes(`activities.${idx}.hourlyQuote`)}
                          />}
                        </TableCell>
                        <TableCell className={classes.cell}>
                          {userActivity && <TextField
                            type='number'
                            fullWidth
                            value={userActivity.travelQuote || ''}
                            placeholder={`${user.defaultTravelQuote || ''}`}
                            onChange={e => this.updateActivityField(activity.activityId, client._id, 'travelQuote', e.target.value)}
                            disabled={saving}
                            error={errorFields.includes(`activities.${idx}.travelQuote`)}
                          />}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </React.Fragment>
              ))
            }
          </TableBody>
        </Table>
        </Grid>
      </Grid>
    )
  }

}

const getFormattedDate = date => {
  if (!date) {
    return ''
  }
  const d = new Date(date)
  const day = d.getUTCDate()
  const month = d.getUTCMonth()+1
  return `${d.getUTCFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`
}

export default withStyles(styles)(User)
