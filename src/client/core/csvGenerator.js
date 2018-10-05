import fileDownload from 'js-file-download'
import {reduce} from 'lodash'

export function generateAdvancedReportCSV(data, filename) {
  const csv = _arrayToCSV(data, 'date', 'startTime', 'endTime', 'duration', 'clientName', 'username', 'activityName', 'notes')
  fileDownload(csv, filename)
}

export function generateClientsReportCSV(data, filename) {
  const csv = reduce(data,
    (csv, {reports, totalHours, totalPrice}) => csv +
      _arrayToCSV(reports, 'date', 'startTime', 'endTime', 'duration', 'clientName', 'username', 'activityName', 'notes') +
      `totalHours:${totalHours}\n` +
      `totalPrice:${totalPrice}\n\n`,
    '')
  fileDownload(csv, filename)
}

export function generateUsersReportCSV(data, filename) {
  const csv = reduce(data,
    (csv, {reports, totalHours, numberOfWorkdays, salary, travelSalary, totalSalary}) => csv +
      _arrayToCSV(reports, 'date', 'startTime', 'endTime', 'duration', 'clientName', 'username', 'activityName', 'notes') +
      `totalHours:${totalHours}\n` +
      `numberOfWorkdays:${numberOfWorkdays}\n` +
      `salary:${salary}\n` +
      `travelSalary:${travelSalary}\n` +
      `totalSalary:${totalSalary}\n\n`,
    '')
  fileDownload(csv, filename)
}

function _arrayToCSV(arr, ...fields) {
  const headers = `${fields.join(':')}\n`
  return arr.reduce(
    (csv, item) => csv +
      fields.reduce((line, field) => line ? `${line}:${item[field] || ''}` : (item[field] || ''), '') + '\n',
    headers
  )
}
