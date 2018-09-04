const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: String,
  defaultHourlyQuote: Number,
  isArchived: Boolean
})

export default mongoose.model('Activity', schema);
