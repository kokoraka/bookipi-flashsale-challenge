import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function dateFormat(d?: Date | number, format: string = "YYYY-MM-DD"): string {
  if (!d) {
    return ""
  }
  return dayjs(d).format(format)
}

export function dateFormatRelative(d: Date | number): string {
  if (!d) {
    return ""
  }
  return dayjs(d).fromNow();
}

export function isSameDay(d1?: Date | number, d2?: Date | number): boolean {
  if (!d1) {
    return false
  }
  if (!d2) {
    return false
  }
  return dayjs(d1).isSame(dayjs(d2), "day")
}