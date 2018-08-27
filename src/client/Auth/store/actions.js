import {createAction} from 'redux-actions'

const login_request = createAction('AUTH/LOGIN_REQUEST')
const login_success = createAction('AUTH/LOGIN_SUCCESS', (user) => ({user}))
const login_failure = createAction('AUTH/LOGIN_FAILURE', (error) => ({error}))

const login = (email, password) => (dispatch, getState, {apiClient}) => {
  dispatch(login_request())
  return apiClient.authenticate(email, password)
    .then(user => {
      dispatch(login_success(user))
    })
    .catch(error => {
      dispatch(login_failure(error))
      throw error
    })
}

const _logout = createAction('AUTH/LOGOUT')
const logout = () => (dispatch, getState, {apiClient}) => {
  apiClient.forgetToken()
  dispatch(_logout())
}

const restoreToken = () => (dispatch, getState, {apiClient}) => {
  if (!apiClient.isAuthenticated()) {
    return
  }

  apiClient.fetchAuthenticatedUser()
    .then(user => dispatch(login_success(user)))
}

export {
  login,
  logout,
  restoreToken
}
