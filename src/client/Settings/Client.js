import React from 'react'
import PropTypes from 'prop-types'
import {get} from 'lodash'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import IconButton from '@material-ui/core/IconButton'
import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'

import TextField from 'common/TextField'
import ActivityIndicator from 'common/ActivityIndicator'
import MultipleSelection from 'common/MultipleSelection'

import * as clientsService from 'core/clientsService'


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

const EMPTY_CLIENT = {
  _id: '',
  name: '',
  contactPersonName: '',
  phone: '',
  address: '',
  email: '',
  notes: '',
  activities: [],
}

class Client extends React.PureComponent {

  static propTypes = {
    classes: PropTypes.object.isRequired,
    clientId: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.oneOf(['new'])
    ]).isRequired,
    activities: PropTypes.array.isRequired,
    onUpdate: PropTypes.func.isRequired
  };

  state = {
    loading: true,
    saving: false,
    client: null,
    hasChanges: false,
    errorFields: [],
  }

  constructor(props) {
    super(props)
    if (props.clientId === 'new') {
      this.state = {
        ...this.state,
        loading: false,
        client: EMPTY_CLIENT
      }
    } else {
      this.fetchClient(props.clientId)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.clientId !== this.props.clientId) {
      if (nextProps.clientId === 'new') {
        this.setState({
          ...this.state,
          loading: false,
          saving: false,
          errorFields: [],
          client: EMPTY_CLIENT
        })
      } else {
        this.setState({
          loading: true,
          saving: false,
          errorFields: [],
          client: null
        })
        this.fetchClient(nextProps.clientId)
      }
    }
  }


  async fetchClient(clientId) {
    const client = await clientsService.getClientById(clientId)
    this.setState({
      loading: false,
      client: {
        ...EMPTY_CLIENT,
        ...client
      }
    })
  }

  setValue(key, value) {
    this.setState({
      hasChanges: true,
      client: {
        ...this.state.client,
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
      this.state.client.activities.find(({activityId}) => activityId === id) || {
        activityId: id
      }
    )))

    if (this.state.errorFields.find(errField => errField.startsWith('activities'))) {
      this.setState({
        errorFields: this.state.errorFields.filter(field => !field.startsWith('activities'))
      })
    }
  }

  updateHourlyQuote(id, hourlyQuote) {
    const {activities} = this.state.client
    const idx = activities.findIndex(({activityId}) => activityId === id)
    if (idx === -1) {
      return
    }
    this.setValue('activities', [
      ...activities.slice(0, idx),
      {
        ...activities[idx],
        hourlyQuote
      },
      ...activities.slice(idx+1)
    ])

    const errKey = `activities.${idx}.hourlyQuote`
    if (this.state.errorFields.includes(errKey)) {
      this.setState({
        errorFields: this.state.errorFields.filter(field => field !== errKey)
      })
    }
  }

  async save() {
    this.setState({
      saving: true,
      errorFields: [],
    })
    const {_id, ...settings} = this.state.client
    try {
      const client = _id ?
        await clientsService.updateClient(_id, settings) :
        await clientsService.addClient(settings)

      this.setState({
        client: {
          ...EMPTY_CLIENT,
          ...client
        },
        hasChanges: false,
        errorFields: [],
        saving: false
      })
      this.props.onUpdate(client)
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
    const {clientId} = this.props
    await clientsService.deleteClient(clientId)
    this.props.onDelete(clientId)
  }

  render() {
    const {classes, activities} = this.props
    const {loading, client, hasChanges, saving, errorFields} = this.state

    if (loading) {
      return <ActivityIndicator />
    }

    return (
      <Grid container direction='column'>
        <Grid container justify='space-between'>
          <Grid item>
            <Typography className={classes.title} variant='title'>
              פרטי לקוח
            </Typography>
          </Grid>
          <Grid item>
            {saving && <ActivityIndicator />}
            {!saving && hasChanges && <IconButton onClick={this.save}>
              <SaveIcon />
            </IconButton>}
            {!saving && client._id && <IconButton onClick={this.delete}>
              <DeleteIcon />
            </IconButton>}
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={1}>
            <TextField
              label='מספר לקוח'
              value={client._id}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label='שם'
              value={client.name || ''}
              onChange={e => this.setValue('name', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('name')}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <TextField
              label='שם איש קשר'
              value={client.contactPersonName || ''}
              onChange={e => this.setValue('contactPersonName', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('contactPersonName')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label='טלפון'
              value={client.phone || ''}
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
              value={client.address || ''}
              onChange={e => this.setValue('address', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('address')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label='email'
              value={client.email || ''}
              onChange={e => this.setValue('email', e.target.value)}
              fullWidth
              disabled={saving}
              error={errorFields.includes('email')}
            />
          </Grid>
        </Grid>
        <Grid item>
          <TextField
            label='הערות'
            multiline
            value={client.notes || ''}
            onChange={e => this.setValue('notes', e.target.value)}
            fullWidth
            disabled={saving}
            error={errorFields.includes('notes')}
          />
        </Grid>
        <Grid item>
          <Typography className={classes.title} variant='title'>
            פעילויות
          </Typography>
        </Grid>
        <Grid item>
          <MultipleSelection
            label='פעילויות'
            disabled={saving}
            value={client.activities.map(x => x.activityId)}
            onChange={this.updateActivities}
            data={activities}
            displayField='name'
          />
        </Grid>
        <Grid item>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell className={classes.cell}>פעילות</TableCell>
                <TableCell className={classes.cell}>תעריף שעתי</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {client.activities.map(({activityId, hourlyQuote}, idx) => {
                const activity = activities.find(({_id}) => _id === activityId )
                if (!activity) {
                  return null
                }
                return (
                  <TableRow key={activityId}>
                    <TableCell className={classes.cell}>
                      {activity.name}
                    </TableCell>
                    <TableCell className={classes.cell}>
                      <TextField
                        type='number'
                        min='0'
                        disabled={saving}
                        value={hourlyQuote || ''}
                        onChange={e => this.updateHourlyQuote(activityId, e.target.value)}
                        error={errorFields.includes(`activities.${idx}.hourlyQuote`)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    )
  }

}

export default withStyles(styles)(Client)
