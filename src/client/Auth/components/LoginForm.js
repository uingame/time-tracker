import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Button, TextField, ErrorMessage} from 'common/components'

import apiClient from 'core/apiClient'

import {login, logout} from '../store/actions'

class LoginForm extends Component {
  state = {
    email: '',
    password: '',
    emailError: '',
    passwordError: ''
  }
  performLogin(e) {
    e.preventDefault()
    e.stopPropagation()

    const {email, password} = this.state
    this.props.login(email, password)
  }

  logout(e) {
    e.preventDefault()
    e.stopPropagation()

    this.props.logout()
  }

  setPassword (e, password) {
    this.setState({password})
    if (!password) {
      this.setState({passwordError: 'required!'})
    } else {
      this.setState({passwordError: ''})
    }
  }

  setEmail (e, email) {
    this.setState({email})
    if (!email) {
      this.setState({emailError: 'required!'})
    } else {
      this.setState({emailError: ''})
    }
  }


  render() {
    const {user, error} = this.props
    const {email, password, emailError, passwordError} = this.state
    return(
      <div>
        <h2>Login</h2>
        {!user &&
          <form onSubmit={this.performLogin}>
            <div>
              <TextField
                name='email'
                label='Email'
                value={email}
                onChange={this.setEmail}
                errorText={emailError}
              />
            </div>
            <div>
              <TextField
                name='password'
                label='Password'
                type='password'
                value={password}
                onChange={this.setPassword}
                errorText={passwordError}
              />
            </div>
            <div>
              <Button type='submit' disabled={!(email && password)}>Login</Button>
            </div>
            <ErrorMessage>{error}</ErrorMessage>
          </form>
        }
        {user &&
          <div>
            <div>
              Authenticated as {user.username}
            </div>
            <div>
              <Button onClick={this.logout}>Logout</Button>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default connect(
  state => state.auth,
  {
    login,
    logout
  }
)(LoginForm)
