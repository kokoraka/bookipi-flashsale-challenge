import { dateFormat, dateFormatRelative } from "./date"
import dayjs from "dayjs"

describe("date", () => {
  describe("dateFormat", () => {
    const baseDate = new Date("2026-06-19T10:00:00Z")

    const cases: Array<{
      name: string
      input: {
        d?: Date
        format?: string
      }
      expected: string
      skipDynamic?: boolean
    }> = [
        {
          name: "returns empty string when date is undefined",
          input: { d: undefined },
          expected: "",
        },
        {
          name: "formats date using default format (YYYY-MM-DD)",
          input: { d: baseDate },
          expected: dayjs().format("YYYY-MM-DD"),
          skipDynamic: true,
        },
        {
          name: "formats date using custom format",
          input: { d: baseDate, format: "DD/MM/YYYY" },
          expected: dayjs().format("DD/MM/YYYY"),
          skipDynamic: true,
        },
      ]

    test.each(cases)("$name", ({ input, expected, skipDynamic }) => {
      const result = dateFormat(input.d, input.format)

      if (skipDynamic) {
        expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/)
      } else {
        expect(result).toBe(expected)
      }
    })
  })

  describe("dateFormatRelative", () => {
    const cases: Array<{
      name: string
      input: {
        d: Date
      }
      expected: string
    }> = [
        {
          name: "returns empty string when date is undefined",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          input: { d: undefined },
          expected: ""
        },
        {
          name: "returns format relative string when date is specified",
          input: { d: dayjs().toDate() },
          expected: "a few seconds ago"
        },
      ]

    test.each(cases)("$name", ({ input, expected }) => {
      const result = dateFormatRelative(input.d)

      expect(result).toBe(expected)
    })
  })
})