import fileDownload from 'js-file-download'

export function generateAdvancedReportCSV(data, filename) {
  const csv = _arrayToCSV(data, 'date', 'startTime', 'endTime', 'duration', 'clientName', 'activityName', 'notes')
  fileDownload(csv, filename)
}

function _arrayToCSV(arr, ...fields) {
  const headers = `${fields.join(';')}\n`
  return arr.reduce(
    (csv, item) => csv +
      fields.reduce((line, field) => line ? `${line};${item[field] || ''}` : (item[field] || ''), '') + '\n',
    headers
  )
}
