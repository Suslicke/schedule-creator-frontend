export function formatTimeRange(start: string, end: string) {
  return `${start}–${end}`
}

export function ymd(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function todayYMD() {
  return ymd(new Date())
}

export function weekRange(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`)
  const day = d.getDay() // Sun=0, Mon=1
  const deltaToMon = (day + 6) % 7
  const start = new Date(d)
  start.setDate(d.getDate() - deltaToMon)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: ymd(start), end: ymd(end) }
}
