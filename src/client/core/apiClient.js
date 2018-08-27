import axios from 'axios'
import {get} from 'lodash'

const BASE_API_URL = '/api'

const client = axios.create({
  baseURL: BASE_API_URL
})

restoreToken()

function setToken(token) {
  localStorage.setItem('token', token)
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
function restoreToken() {
  const token = localStorage.getItem('token')
  if (token) {
    setToken(token)
  }
}
function forgetToken() {
  delete client.defaults.headers.common['Authorization']
  localStorage.removeItem('token')
}

function errorHandler(err) {
  const errorFromServer = get(err, 'response.data.error')
  if (errorFromServer) {
    throw new Error(errorFromServer)
  } else {
    throw err
  }
}

export default {
  authenticate(email, password) {
    return client.post('/auth/token', { email, password })
      .then(({data}) => {
        setToken(data.token)
        return {
          username: data.username,
          email: data.email
        }
      })
      .catch(errorHandler)
  },

  isAuthenticated() {
    return !!client.defaults.headers.common['Authorization']
  },

  forgetToken,

  fetchAuthenticatedUser() {
    if (!this.isAuthenticated()) {
      return Promise.reject('Not Authenticated')
    } else {
      return client.get('/auth/user')
        .then(resp => resp.data)
        .catch(errorHandler)
    }
  }
}
