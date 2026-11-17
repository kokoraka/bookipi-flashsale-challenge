import { describe, expect, it } from "vitest"

import {
  AlertStyle,
  AlertVariant,
} from "./Resource"

describe("AlertStyle", () => {
  describe("buildContainer", () => {
    it.each([
      [
        AlertVariant.INFO,
        "bg-blue-200 border-blue-300",
      ],
      [
        AlertVariant.SUCCESS,
        "bg-green-200 border-green-300",
      ],
      [
        AlertVariant.WARNING,
        "bg-orange-200 border-orange-300",
      ],
      [
        AlertVariant.DANGER,
        "bg-red-200 border-red-300",
      ],
    ])("returns the correct container classes for %s", (variant, expected) => {
      const style = new AlertStyle()
        .setVariant(variant)
        .buildContainer()

      expect(style).toContain("flex")
      expect(style).toContain("border")
      expect(style).toContain(expected)
    })

    it("returns only the base container classes for an unknown variant", () => {
      const style = new AlertStyle()
        .setVariant("unknown")
        .buildContainer()

      expect(style).toBe(
        "flex flex-row p-5 my-2 rounded border shadow-sm"
      )
    })
  })

  describe("buildTitle", () => {
    it.each([
      [
        AlertVariant.INFO,
        "text-blue-800",
      ],
      [
        AlertVariant.SUCCESS,
        "text-green-800",
      ],
      [
        AlertVariant.WARNING,
        "text-orange-800",
      ],
      [
        AlertVariant.DANGER,
        "text-red-800",
      ],
    ])("returns the correct title classes for %s", (variant, expected) => {
      const style = new AlertStyle()
        .setVariant(variant)
        .buildTitle()

      expect(style).toContain("font-semibold")
      expect(style).toContain("text-md")
      expect(style).toContain(expected)
    })

    it("returns only the base title classes for an unknown variant", () => {
      const style = new AlertStyle()
        .setVariant("unknown")
        .buildTitle()

      expect(style).toBe("font-semibold text-md")
    })
  })

  describe("setVariant", () => {
    it("returns the same AlertStyle instance", () => {
      const style = new AlertStyle()

      expect(style.setVariant(AlertVariant.INFO)).toBe(style)
    })

    it("changes the variant used by subsequent builds", () => {
      const style = new AlertStyle()

      style.setVariant(AlertVariant.INFO)
      expect(style.buildTitle()).toContain("text-blue-800")

      style.setVariant(AlertVariant.DANGER)
      expect(style.buildTitle()).toContain("text-red-800")
    })
  })
})