import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Header from './Header'

const styles = {
  root: {
    margin: 10
  }
}

const AppShell = ({classes, children}) => (
  <div className={classes.root}>
    <Header />
    <main>
      {children}
    </main>
  </div>
)

export default withStyles(styles)(AppShell)
