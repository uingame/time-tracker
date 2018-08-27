import React from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

// import {LoginForm} from 'Auth/components'
import AppShell from './AppShell'
import {StylesProvider} from './styles'
import {TimeTracking} from '../TimeTracking'
import {ClientsReport, UsersReport, TimeReport} from '../Reports'

const App = () => (
  <StylesProvider>
    <Router>
      <AppShell>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/clientsreport" component={ClientsReport} />
          <Route path="/usersreport" component={UsersReport} />
          <Route path="/timereport" component={TimeReport} />
          <Route path="/timetracking" component={TimeTracking} />
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
