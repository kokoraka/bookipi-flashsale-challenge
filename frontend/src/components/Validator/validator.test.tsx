import { describe, expect, it } from "vitest"
import { useValidator, ValidationError, Validator } from "./validator"

describe("ValidationError", () => {
  it("returns its code and message", () => {
    const err = new ValidationError(
      "ERR.CODE",
      "Something went wrong",
    )

    expect(err.getCode()).toBe("ERR.CODE")
    expect(err.getMessage()).toBe("Something went wrong")
  })

  it("returns an empty issues map by default", () => {
    const err = new ValidationError(
      "ERR.CODE",
      "Something went wrong",
    )

    expect(err.hasIssues()).toBe(false)
    expect(err.getIssues()).toEqual(new Map())
  })

  it("returns the provided issues", () => {
    const issues = new Map<string, ValidationError[]>()

    issues.set("name", [
      new ValidationError(
        "VALIDATION.REQUIRED",
        "Required",
      ),
    ])

    const err = new ValidationError(
      "VALIDATION.INVALID_PARAM",
      "Validation failed",
      issues,
    )

    expect(err.hasIssues()).toBe(true)
    expect(err.getIssues()).toBe(issues)
  })
})

describe("useValidator", () => {
  it("returns validated data", () => {
    const [validator] = useValidator({
      name: Validator.string().required(),
    })

    const result = validator.validate({
      name: "John",
    })

    expect(result.error).toBeUndefined()
    expect(result.data).toEqual({
      name: "John",
    })
  })

  it("returns validation errors", () => {
    const [validator] = useValidator({
      name: Validator.string().required("Name is required"),
    })

    const result = validator.validate({})

    expect(result.data).toBeUndefined()
    expect(result.error).toBeInstanceOf(ValidationError)

    expect(result.error?.getCode()).toBe(
      "VALIDATION.INVALID_PARAM",
    )

    expect(result.error?.hasIssues()).toBe(true)

    const issues = result.error?.getIssues()

    expect(issues?.has("name")).toBe(true)

    const fieldErrors = issues?.get("name")

    expect(fieldErrors).toHaveLength(1)

    expect(fieldErrors?.[0].getCode()).toBe(
      "VALIDATION.optionality",
    )

    expect(fieldErrors?.[0].getMessage()).toBe(
      "Name is required",
    )
  })

  it("normalizes array paths", () => {
    const [validator] = useValidator({
      items: Validator.array().of(
        Validator.object({
          name: Validator.string().required("Required"),
        }),
      ),
    })

    const result = validator.validate({
      items: [{}],
    })

    const issues = result.error?.getIssues()

    expect(issues?.has("items.0.name")).toBe(true)
  })

  it("returns multiple validation errors when abortEarly is false", () => {
    const [validator] = useValidator(
      {
        name: Validator.string().required("Name"),
        email: Validator.string().required("Email"),
      },
      {
        abortEarly: false,
      },
    )

    const result = validator.validate({})

    const issues = result.error?.getIssues()

    expect(issues?.size).toBe(2)
    expect(issues?.has("name")).toBe(true)
    expect(issues?.has("email")).toBe(true)
  })

  it("returns only one validation error when abortEarly is true", () => {
    const [validator] = useValidator(
      {
        name: Validator.string().required("Name"),
        email: Validator.string().required("Email"),
      },
      {
        abortEarly: true,
      },
    )

    const result = validator.validate({})

    const issues = result.error?.getIssues()

    expect(issues?.size).toBeLessThanOrEqual(1)
  })

  it("returns a system error for non-Yup exceptions", () => {
    const [validator] = useValidator({})

    const original = Validator.object

    Validator.object = (() => ({
      validateSync() {
        throw new Error("boom")
      },
    })) as never

    const result = validator.validate({})

    expect(result.error?.getCode()).toBe(
      "SYSTEM.UNKNOWN_ERROR",
    )
    expect(result.error?.getMessage()).toBe("boom")

    Validator.object = original
  })
})