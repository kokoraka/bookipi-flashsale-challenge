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
