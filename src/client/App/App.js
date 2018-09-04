import React from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

// import {LoginForm} from 'Auth/components'
import AppShell from './AppShell'
import {StylesProvider} from './styles'
import {TimeTracking} from '../TimeTracking'
import {ClientsReport, UsersReport, TimeReport} from '../Reports'
import {Settings, Activities} from '../Settings'
import {LoginForm} from '../Auth'

const App = () => (
  <StylesProvider>
    <Router>
      <AppShell>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={LoginForm} />
          <Route path="/clientsreport" component={ClientsReport} />
          <Route path="/usersreport" component={UsersReport} />
          <Route path="/timereport" component={TimeReport} />
          <Route path="/timetracking" component={TimeTracking} />
          <Route path="/users" component={Settings} />
          <Route path="/clients" component={TimeReport} />
          <Route path="/activities" component={Activities} />
        </Switch>
      </AppShell>
    </Router>
  </StylesProvider>
)

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

export default App
