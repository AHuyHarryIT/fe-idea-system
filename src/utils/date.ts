import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

export const APP_DATE_FORMAT = 'DD/MM/YYYY'
export const APP_DATE_TIME_FORMAT = 'HH:mm:ss DD/MM/YYYY'
export const APP_MONTH_LABEL_FORMAT = 'MMM'
export const HTML_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm'

export function formatAppDate(value?: string, emptyLabel = '—') {
  if (!value) {
    return emptyLabel
  }

  const parsed = dayjs(value)

  return parsed.isValid() ? parsed.format(APP_DATE_FORMAT) : value
}

export function formatAppDateTime(value?: string, emptyLabel = '—') {
  if (!value) {
    return emptyLabel
  }

  const parsed = dayjs(value)

  return parsed.isValid() ? parsed.format(APP_DATE_TIME_FORMAT) : value
}

export function formatMonthLabel(value: string | Date) {
  const parsed = dayjs(value)

  return parsed.isValid() ? parsed.format(APP_MONTH_LABEL_FORMAT) : String(value)
}

export function getDateTimestamp(value?: string) {
  if (!value) {
    return 0
  }

  const parsed = dayjs(value)

  return parsed.isValid() ? parsed.valueOf() : 0
}

export function formatDateTimeInputValue(value: string) {
  if (!value) {
    return ''
  }

  const parsed = dayjs(value)

  if (!parsed.isValid()) {
    return value.slice(0, 16)
  }

  return parsed.format(HTML_DATETIME_FORMAT)
}

export function parseDateTimeInputValue(value: string): Dayjs | null {
  if (!value) {
    return null
  }

  const parsed = dayjs(value)

  return parsed.isValid() ? parsed : null
}

export function getDateYear(value?: string) {
  const parsed = value ? dayjs(value) : dayjs()

  return parsed.isValid() ? parsed.year() : dayjs().year()
}
