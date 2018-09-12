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

import User from './User'

import * as usersService from 'core/usersService'
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

class Users extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  state = {
    loading: true,
    clients: [],
    filter: '',
    activities: [],
    selectedId: null
  }

  constructor(props) {
    super(props)
    this.init()
  }

  async init() {
    const [clients, activities, users] = await Promise.all([
      clientsService.getAllClients(),
      activitiesService.getAllActivities(),
      usersService.getAllUsers()
    ])
    this.setState({
      loading: false,
      clients,
      activities,
      users
    })
  }

  setFilter(e) {
    this.setState({
      filter: e.target.value
    })
  }

  selectUser(user) {
    this.setState({
      selectedId: user._id
    })
  }

  addNewUser() {
   this.setState({
     selectedId: 'new'
   })
  }

  onUpdate(user) {
    const idx = this.state.users.findIndex(({_id}) => _id === user._id)
    if (idx === -1) {
      this.setState({
        users: [
          user,
          ...this.state.users
        ],
        selectedId: user._id
      })
    } else {
      this.setState({
        users: [
          ...this.state.users.slice(0, idx),
          user,
          ...this.state.users.slice(idx+1)
        ]
      })
    }
  }

  onDelete(userId) {
    this.setState({
      users: this.state.users.filter(({_id}) => _id !== userId),
      selectedId: null
    })
  }

  render() {
    const {classes} = this.props
    const {loading, users, selectedId, activities, clients, filter} = this.state

    if (loading) {
      return <ActivityIndicator />
    }

    return (
      <Grid container spacing={24}>
        <Grid item xs={4}>
          <TextField label='חיפוש' fullWidth={true} onChange={this.setFilter} value={filter}/>
          <Paper>
            <List>
              {users.filter(({displayName}) => displayName.includes(filter)).map(user => [
                <ListItem
                  key={user._id}
                  button
                  selected={user._id === selectedId}
                  onClick={() => this.selectUser(user)}
                >
                  <ListItemText className={classes.listItemText}
                  primary={`${user.firstName} ${user.lastName}`}
                />
                </ListItem>
              ])}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Grid container spacing={24} direction='column'>
            <Grid item className={classes.buttonsRow}>
              <Button onClick={this.addNewUser} variant="contained" color="primary">
                <AddIcon className={classes.newIcon}/>
                עובד חדש
              </Button>
            </Grid>
            <Grid item>
              {selectedId && <Paper>
                <User
                  userId={selectedId}
                  activities={activities}
                  clients={clients}
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

export default withStyles(styles)(Users)
