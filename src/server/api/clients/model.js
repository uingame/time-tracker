const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  activityId: {type: String, required: true},
  hourlyQuote: Number
}, {
  _id: false
})

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true, sparse: true},
  contactPersonName: String,
  address: String,
  email: String,
  phone: String,
  notes: String,

  activities: [activitySchema],

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
