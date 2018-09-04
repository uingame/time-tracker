const Model = require('./model')

export async function getAllActivities() {
  const activities = await Model.find().exec()
  return activities
}

export async function getActivityById(id) {
  const activity = await Model.findById(id).exec()
  return activity

}

export async function addActivity(newActivity) {
  const activity = await Model.create(newActivity)
  return activity
}

export async function updateActivity(id, updatedFields) {
  const activity = await model.findByIdAndUpdate(id, updatedFields, {
    lean: true,
    new: true,
    runValidators: true
  }).exec()
  return activity;
}

export async function archiveActivity(id) {
  const activity = await model.findByIdAndUpdate(id, {isArchived: true}, {
    lean: true,
    new: true,
    runValidators: true
  }).exec()
  return true;
}