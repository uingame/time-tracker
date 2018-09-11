import apiClient from 'core/apiClient'
import querystring from 'querystring'

export async function getReports(startDate, endDate, group, filter) {
  const query = {
    startDate,
    endDate
  }
  if (group) {
    query.group = group
  }
  if (filter) {
    Object.keys(filter).forEach(key => {
      query[`filter[${key}]`] = filter[key]
    })
  }
  const {data} = await apiClient.get(`/reports?${querystring.stringify(query)}`)
  return data
}
