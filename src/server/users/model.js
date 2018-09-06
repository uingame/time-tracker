const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},

  isAdmin: {type: Boolean, default: false},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  idNumber: {type: Number, required: true, unique: true},
  address: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  startDate: {type: String, required: true, default: getCurrentDateTimestamp},

  type: {type: String, enum: ['employee', 'contractor']},
  lastReportDay: {type: Number, min: 1, max: 31},
  defaultHourlyQuote: {type: Number, min: 0, default: 0},
  defaultTravelQuote: {type: Number, min: 0, default: 0},

  activities: [],

  isArchived: Boolean,
  isSystem: Boolean
}, {
  toObject: {
    transform: (doc, ret) => {
      delete ret.__v
      delete ret.password
    }
  }
})

module.exports = mongoose.model('User', schema);

function getCurrentDateTimestamp() {
  const d = new Date()
  d.setUTCHours(0)
  d.setUTCMinutes(0)
  d.setUTCSeconds(0)
  d.setUTCMilliseconds(0)
  return d.toISOString()
}
