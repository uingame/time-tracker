const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  contactPersonName: String,
  address: String,
  email: String,
  phone: String,

  activities: [{
    activityId: {type: String, required: true},
    hourlyQuote: Number
  }],

  isArchived: Boolean
}, {
  toObject: {
    transform: (doc, ret) => {
      delete ret.__v
      delete ret.password
    }
  }
})

module.exports = mongoose.model('Client', schema);
