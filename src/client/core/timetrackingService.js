import apiClient from 'core/apiClient'
import querystring from 'querystring'

export async function getMonthTimeTracking(month, year) {
  const {data} = await apiClient.get(`/timetracking?${querystring.stringify({month, year})}`)
  return data
}

export async function addTimeTrackingReport(report) {
  const {data} = await apiClient.post('/timetracking', report)
  return data
}

export async function updateTimeTrackingReport(id, updatedProps) {
  const {data} = await apiClient.put(`/timetracking/${id}`, updatedProps)
  return data
}

export async function deleteTimeTrackingReport(id) {
  const {data} = await apiClient.delete(`/timetracking/${id}`)
  return data
}
