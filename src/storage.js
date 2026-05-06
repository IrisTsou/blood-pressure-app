export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getCurrentTime() {
  return new Date().toTimeString().slice(0, 5);
}

export function formatMeasuredAt(record) {
  return `${record.date} ${record.time}`;
}
