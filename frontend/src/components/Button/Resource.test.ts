/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest"
import {
  ButtonStyle,
  ButtonTheme,
  ButtonVariant,
  ButtonSize,
} from "./Resource"

describe("ButtonStyle (table tests)", () => {
  const cases: Array<{
    name: string
    input: ButtonStyle
    expected: string
  }> = [
      {
        name: "builds default primary medium enabled button",
        input: new ButtonStyle()
          .setTheme(ButtonTheme.DEFAULT)
          .setVariant(ButtonVariant.PRIMARY)
          .setSize(ButtonSize.MEDIUM)
          .setDisabled(false),
        expected:
          "inline-block ease-out duration-500 bg-simple-primary hover:bg-simple-primary-hover text-white rounded-md py-2 px-6 cursor-pointer",
      },
      {
        name: "builds success large disabled button",
        input: new ButtonStyle()
          .setTheme(ButtonTheme.DEFAULT)
          .setVariant(ButtonVariant.SUCCESS)
          .setSize(ButtonSize.LARGE)
          .setDisabled(true),
        expected:
          "inline-block ease-out duration-500 bg-green-600 hover:bg-green-500 text-white rounded-md py-3 px-8 lg:px-10 disabled:bg-gray-300 disabled:border-0 disabled:text-gray-800 cursor-not-allowed",
      },
      {
        name: "builds warning xl button with custom class",
        input: new ButtonStyle()
          .setTheme(ButtonTheme.DEFAULT)
          .setVariant(ButtonVariant.WARNING)
          .setSize(ButtonSize.XLARGE)
          .setDisabled(false)
          .appendClassNames("extra-class"),
        expected:
          "inline-block ease-out duration-500 bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-3.5 lg:py-4 px-6 sm:px-6 md:px-8 lg:px-10 cursor-pointer extra-class",
      },
      {
        name: "returns default theme string when theme is not set",
        input: new ButtonStyle()
          .setVariant(ButtonVariant.PRIMARY)
          .setSize(ButtonSize.MEDIUM),
        expected: "inline-block ease-out duration-500 bg-simple-primary hover:bg-simple-primary-hover text-white rounded-md py-2 px-6 cursor-pointer",
      },
      {
        name: "ignores unknown variant gracefully",
        input: new ButtonStyle()
          .setTheme(ButtonTheme.DEFAULT)
          .setVariant("unknown" as any)
          .setSize(ButtonSize.MEDIUM),
        expected:
          "inline-block ease-out duration-500 rounded-md py-2 px-6 cursor-pointer",
      },
      {
        name: "ignores unknown size gracefully",
        input: new ButtonStyle()
          .setTheme(ButtonTheme.DEFAULT)
          .setVariant(ButtonVariant.PRIMARY)
          .setSize("xxxl" as any),
        expected:
          "inline-block ease-out duration-500 bg-simple-primary hover:bg-simple-primary-hover text-white cursor-pointer",
      },
    ]

  it.each(cases)("$name", ({ input, expected }) => {
    expect(input.build()).toBe(expected)
  })
})