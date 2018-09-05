import React from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import CssBaseline from '@material-ui/core/CssBaseline';

// import {LoginForm} from 'Auth/components'
import AppShell from './AppShell'
import {StylesProvider} from './styles'
import {TimeTracking} from '../TimeTracking'
import {ClientsReport, UsersReport, TimeReport} from '../Reports'
import {Settings, Activities} from '../Settings'
import {LoginForm, authService} from '../Auth'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.init()
  }

  async init() {
    const user = await authService.restoreAuth()
    this.setState({user})
  }

  state = {
    user: null
  }

  render() {
    return (
      <StylesProvider>
        <CssBaseline />
        <Router>
          <AppShell>
            <Switch>
              <Route exact path="/" render={() => <Redirect to={getRedirectUrl()}/>} />
              <Route path="/login" component={LoginForm} />
              <PrivateRoute adminOnly path="/clientsreport" component={ClientsReport} />
              <PrivateRoute adminOnly path="/usersreport" component={UsersReport} />
              <PrivateRoute adminOnly path="/timereport" component={TimeReport} />
              <PrivateRoute path="/timetracking" component={TimeTracking} />
              <PrivateRoute adminOnly path="/users" component={Settings} />
              <PrivateRoute adminOnly path="/clients" component={TimeReport} />
              <PrivateRoute adminOnly path="/activities" component={Activities} />
            </Switch>
          </AppShell>
        </Router>
      </StylesProvider>
    )
  }
}

const PrivateRoute = ({ component: Component, adminOnly, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      const user = authService.getSignedInUser()
      if (!user) {
        return (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }

      if (adminOnly && !user.isAdmin) {
        return (
          <Redirect
            to={{
              pathname: "/timetracking"
            }}
          />
        )
      }

      return <Component {...props} />
    }}
  />
);

const getRedirectUrl = () => {
  const user = authService.getSignedInUser()
  if (!user) {
    return "/login"
  }

  return user.isAdmin ? '/usersreport' : '/timetracking'
}

export default App
