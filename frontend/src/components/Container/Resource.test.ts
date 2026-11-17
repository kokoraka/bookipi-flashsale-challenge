import { ContainerStyle } from "./Resource"

describe("Container resource", () => {
  describe("ContainerStyle class", () => {
    let style: ContainerStyle

    beforeEach(() => {
      style = new ContainerStyle()
    })

    describe("setSize function", () => {
      const testcases = [
        [
          "full",
          "w-full px-6 xl:px-0 mx-auto",
        ],
        [
          "2xl",
          "w-full px-6 xl:px-0 mx-auto max-w-[1800px]",
        ],
        [
          "xl",
          "w-full px-6 xl:px-0 mx-auto max-w-[1600px]",
        ],
        [
          "lg",
          "w-full px-6 xl:px-0 mx-auto max-w-[1400px]",
        ],
        [
          "md",
          "w-full px-6 xl:px-0 mx-auto max-w-[1200px]",
        ],
        [
          "sm",
          "w-full px-6 xl:px-0 mx-auto max-w-[1200px]",
        ],
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      test.each(testcases)("when input is %s should return %s", (size: string, res: string): any => {
        const container = style
          .setSize(size)
          .build()

        expect(container).toEqual(res)
      })
    })
  })
})
