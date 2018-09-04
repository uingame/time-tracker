const {isString, isPlainObject} = require('lodash')

module.exports = class UserError extends Error {
  constructor(msg) {
    if (isString(msg)) {
      super(msg)
    } else if (isPlainObject(msg)) {
      super('Errors occurred')
      this.fields = msg
    }
  }
}
