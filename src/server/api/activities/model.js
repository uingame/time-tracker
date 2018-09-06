const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true, sparse: true},
  defaultHourlyQuote: Number,
  isArchived: Boolean
}, {
  toObject: {
    transform: (doc, ret) => {
      delete ret.__v
    }
  }
})

module.exports = mongoose.model('Activity', schema);
