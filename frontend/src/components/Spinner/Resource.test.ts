import { SpinnerStyle } from "./Resource"

describe("Spinner resource", () => {
  describe("SpinnerStyle class", () => {
    let style: SpinnerStyle

    beforeEach(() => {
      style = new SpinnerStyle()
    })

    describe("setVariant function", () => {
      const testcases = [
        [
          "primary",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full text-gray-700",
        ],
        [
          "secondary",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full text-white",
        ],
        [
          "info",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full text-blue-500",
        ],
        [
          "success",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full text-green-500",
        ],
        [
          "danger",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full text-rose-500",
        ],
        [
          "warning",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full text-amber-500",
        ],
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      test.each(testcases)("when input is %s should return %s", (variant: string, result: string): any => {
        const res = style.
          setVariant(variant).
          buildContainer()

        expect(res).toEqual(result)
      })
    })

    describe("setSize function", () => {
      const testcases = [
        [
          "xl",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full w-36 h-36",
        ],
        [
          "lg",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full w-24 h-24",
        ],
        [
          "md",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full w-16 h-16",
        ],
        [
          "sm",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full w-10 h-10",
        ],
        [
          "xs",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full w-4 h-4",
        ],
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      test.each(testcases)("when input is %s should return %s", (size: string, result: string): any => {
        const res = style.
          setSize(size).
          buildContainer()

        expect(res).toEqual(result)
      })
    })

    describe("appendClassNames function", () => {
      const testcases = [
        [
          "text-lg",
          "animate-spin border-[4px] border-current border-t-transparent rounded-full text-lg",
        ],
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      test.each(testcases)("when input is %s should return %s", (appended: string, result: string): any => {
        const res = style.
          appendClassNames(appended).
          buildContainer()

        expect(res).toEqual(result)
      })
    })
  })
})
