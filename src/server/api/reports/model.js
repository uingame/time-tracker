const mongoose = require('mongoose')

TIME_REGEXP = /^([0-1]?[0-9]|2[0-3]):[0-5]?[0-9]$/

const schema = new mongoose.Schema({
  userId: {type: String, required: true},
  clientId: {type: String, required: true},
  activityId: {type: String, required: true},

  date: {type: Date, required: true},
  startTime: {type: String, required: true, match: TIME_REGEXP},
  endTime: {type: String, required: true, match: TIME_REGEXP},
  duration: {type: Number, required: true, min: 0},
  notes: {type: String, default: ''}
}, {
  toObject: {
    transform: (doc, ret) => {
      delete ret.__v
    }
  }
})

module.exports = mongoose.model('Report', schema);
