import React from 'react'
import {get} from 'lodash'
import {Snackbar, withStyles} from '@material-ui/core'
import apiClient from 'core/apiClient'

const styles = theme => ({
  error: {
    marginTop: theme.spacing.unit,
    backgroundColor: theme.palette.error.dark
  }
})

class ErrorDisplay extends React.Component {

  state = {
    errorMessage: null
  }

  constructor(props) {
    console.log('yo')
    super(props)
    apiClient.interceptors.response.use(null, error => {
      this.setState({
        errorMessage: get(error, 'response.data.error', 'unknown server error')
      })
      return Promise.reject(error)
    })

  }

  handleClose() {
    this.setState({errorMessage: null})
  }

  render() {
    const {classes} = this.props
    const {errorMessage} = this.state

    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={!!errorMessage}
        autoHideDuration={2000}
        onClose={this.handleClose}
        message={errorMessage}
        ContentProps={{
          className: classes.error
        }}
      />
    )
  }
}

export default withStyles(styles)(ErrorDisplay)
