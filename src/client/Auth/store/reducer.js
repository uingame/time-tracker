const initialState = {
  user: null,
  authenticating: false,
  error: ''
}

export default function authReducer(state = initialState, action) {
  switch(action.type) {
    case 'AUTH/LOGIN_REQUEST':
      return {
        ...state,
        user: '',
        authenticating: true,
        error: ''
      }
    case 'AUTH/LOGIN_SUCCESS':
      return {
        ...state,
        authenticating: false,
        user: action.payload.user
      }
    case 'AUTH/LOGIN_FAILURE':
      return {
        ...state,
        authenticating: false,
        error: action.payload.message
      }
    case 'AUTH/LOGOUT':
      return initialState
    default:
      return state
  }
}
