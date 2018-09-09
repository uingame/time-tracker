import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import withStyles from '@material-ui/core/styles/withStyles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';

import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add'


import TextField from 'common/TextField'
import ActivityIndicator from 'common/ActivityIndicator'

import Client from './Client'

import * as clientsService from 'core/clientsService'
import * as activitiesService from 'core/activitiesService'

const styles = theme => ({
  listItemText: {
    textAlign: 'right'
  },
  buttonsRow: {
    textAlign: 'left'
  }
})

class Clients extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  state = {
    loading: true,
    clients: [],
    activities: [],
    selectedClientId: null
  }

  constructor(props) {
    super(props)
    this.init()
  }

  async init() {
    const [clients, activities] = await Promise.all([
      clientsService.getAllClients(),
      activitiesService.getAllActivities()
    ])
    this.setState({
      loading: false,
      clients,
      activities,
    })
  }

  selectClient(client) {
    this.setState({
      selectedClientId: client._id
    })
  }

  addNewClient() {
   this.setState({
     selectedClientId: 'new'
   })
  }

  onUpdate(client) {
    const idx = this.state.clients.findIndex(({_id}) => _id === client._id)
    if (idx === -1) {
      this.setState({
        clients: [
          client,
          ...this.state.clients
        ],
        selectedClientId: client._id
      })
    } else {
      this.setState({
        clients: [
          ...this.state.clients.slice(0, idx),
          client,
          ...this.state.clients.slice(idx+1)
        ]
      })
    }
  }

  onDelete(clientId) {
    this.setState({
      clients: this.state.clients.filter(({_id}) => _id !== clientId),
      selectedClientId: null
    })
  }

  render() {
    const {classes} = this.props
    const {loading, clients, selectedClientId, activities} = this.state

    if (loading) {
      return <ActivityIndicator />
    }

    return (
      <Grid container spacing={24}>
        <Grid item xs={4}>
          <TextField label='חיפוש' fullWidth={true}/>
          <Paper>
            <List>
              {clients.map(client => [
                <ListItem
                  key={client._id}
                  button
                  selected={client._id === selectedClientId}
                  onClick={() => this.selectClient(client)}
                >
                  <ListItemText className={classes.listItemText}
                  primary={client.name}
                />
                </ListItem>
              ])}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Grid container spacing={24} direction='column'>
            <Grid item className={classes.buttonsRow}>
              <Button onClick={this.addNewClient} variant="contained" color="primary">
                <AddIcon className={classes.newIcon}/>
                לקוח חדש
              </Button>
            </Grid>
            <Grid item>
              {selectedClientId && <Paper>
                <Client
                  clientId={selectedClientId}
                  activities={activities}
                  onUpdate={this.onUpdate}
                  onDelete={this.onDelete}
                />
              </Paper>}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

}

export default withStyles(styles)(Clients)
