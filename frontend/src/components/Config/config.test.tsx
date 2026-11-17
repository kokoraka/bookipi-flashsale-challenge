import { beforeEach, describe, expect, it } from "vitest"
import { Config, useConfig } from "./config"

describe("Config", () => {
  let values = {}

  beforeEach(() => {
    values = {
      VITE_ENABLED: "true",
      VITE_DISABLED: "false",
      VITE_STRING: "hello",
      VITE_NUMBER: "123",
      VITE_ITEMS: '["a","b","c"]',
      VITE_EMPTY: "",
    }
  })

  it("should detect existing keys", () => {
    const config = Config({
      values
    })

    expect(config.has("VITE_ENABLED")).toBe(true)
    expect(config.has("UNKNOWN")).toBe(false)
  })

  it("should determine whether values are not empty", () => {
    const config = Config({
      values
    })

    expect(config.notEmpty("VITE_STRING")).toBe(true)
    expect(config.notEmpty("VITE_EMPTY")).toBe(false)
    expect(config.notEmpty("UNKNOWN")).toBe(false)
  })

  it("should detect true values", () => {
    const config = Config({
      values
    })

    expect(config.isTrue("VITE_ENABLED")).toBe(true)
    expect(config.isTrue("VITE_DISABLED")).toBe(false)
    expect(config.isTrue("UNKNOWN")).toBe(false)
  })

  it("should detect false values", () => {
    const config = Config({
      values
    })

    expect(config.isFalse("VITE_DISABLED")).toBe(true)
    expect(config.isFalse("VITE_ENABLED")).toBe(false)
    expect(config.isFalse("UNKNOWN")).toBe(false)
  })

  it("should return string values", () => {
    const config = Config({
      values
    })

    expect(config.get("VITE_STRING")).toBe("hello")
    expect(config.get("UNKNOWN")).toBeUndefined()
  })

  it("should return getString values", () => {
    const config = Config({
      values
    })

    expect(config.getString("VITE_STRING")).toBe("hello")
    expect(config.getString("UNKNOWN")).toBe("")
  })

  it("should return numeric values", () => {
    const config = Config({
      values
    })

    expect(config.getNumber("VITE_NUMBER")).toBe(123)
    expect(config.getNumber("UNKNOWN")).toBe(0)
  })

  it("should return array items", () => {
    const config = Config({
      values
    })

    expect(config.items<string>("VITE_ITEMS")).toEqual([
      "a",
      "b",
      "c",
    ])
  })

  it("should return empty array when key is missing", () => {
    const config = Config({
      values
    })

    expect(config.items("UNKNOWN")).toEqual([])
  })

  it("should return empty array when value is empty", () => {
    const config = Config({
      values
    })

    expect(config.items("VITE_EMPTY")).toEqual([])
  })

  it("should expose Config through useConfig", () => {
    const config = useConfig({
      values
    })

    expect(config.getString("VITE_STRING")).toBe("hello")
  })
})