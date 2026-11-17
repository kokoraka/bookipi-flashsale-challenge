import { describe, it, expect } from "vitest"
import { DialogVariant } from "./Resource"

describe("DialogVariant", () => {
  it("should expose the expected values", () => {
    expect(DialogVariant.PRIMARY).toBe("primary")
    expect(DialogVariant.SECONDARY).toBe("secondary")
    expect(DialogVariant.INFO).toBe("info")
    expect(DialogVariant.SUCCESS).toBe("success")
    expect(DialogVariant.DANGER).toBe("danger")
    expect(DialogVariant.WARNING).toBe("warning")
  })

  it("should contain six variants", () => {
    expect(Object.values(DialogVariant)).toEqual([
      "primary",
      "secondary",
      "info",
      "success",
      "danger",
      "warning",
    ])
  })
})