import { describe, it, expect, vi, beforeEach } from "vitest"
import { Status } from "./Status.js"
import { StatusCode } from "./StatusCode.js"

describe("Status", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("instance method", () => {
    it("valid() returns true when code and message exist", () => {
      const status = new Status("OK", "success")

      expect(status.valid()).toBe(true)
    })

    it("valid() returns false when code or message is empty", () => {
      const status = new Status("", "")

      expect(status.valid()).toBe(false)
    })

    it("is() matches single code", () => {
      const status = new Status(StatusCode.SUCCESS, "ok")

      expect(status.is(StatusCode.SUCCESS)).toBe(true)
      expect(status.is(StatusCode.SYSTEM_INTERNAL_ERROR)).toBe(false)
    })

    it("any() matches multiple codes", () => {
      const status = new Status(StatusCode.SUCCESS, "ok")

      expect(
        status.any([StatusCode.SUCCESS, StatusCode.SYSTEM_INTERNAL_ERROR]),
      ).toBe(true)

      expect(status.any([StatusCode.SYSTEM_INTERNAL_ERROR])).toBe(false)
    })

    it("clear() resets all values", () => {
      const status = new Status("X", "Y", new Map([]))

      status.clear()

      expect(status.code).toBe("")
      expect(status.message).toBe("")
      expect(status.validationErrors.size).toBe(0)
    })
  })

  describe("any static function", () => {
    it("Status.any() finds matching code", () => {
      expect(Status.any("A", ["A", "B"])).toBe(true)
      expect(Status.any("A", ["B", "C"])).toBe(false)
    })
  })

  describe("fromObject static function", () => {
    it("fromObject() creates Status correctly", () => {
      const obj = {
        status: {
          code: "VALIDATION.INVALID_PARAM",
          message: "invalid param",
        },
        validation_errors: {
          name: [
            {
              code: "required",
              message: "name is required",
            }
          ],
        },
      }

      const status = Status.fromObject(obj)!

      expect(status.code).toBe("VALIDATION.INVALID_PARAM")
      expect(status.message).toBe("invalid param")
      expect(status.validationErrors.get("name")![0].code!).toEqual("required")
    })

    it("fromObject() returns empty status when undefined", () => {
      const status = Status.fromObject(undefined)

      expect(status).toBe(undefined)
    })
  })

  describe("fromError static function", () => {
    it("fromError() handles Error instance", () => {
      const err = new Error("boom")

      const status = Status.fromError(err)

      expect(status.code).toBe(StatusCode.SYSTEM_UNKNOWN_ERROR)
      expect(status.message).toBe("boom")
    })

    it("fromError() handles unknown error type", () => {
      const status = Status.fromError("something")

      expect(status.code).toBe(StatusCode.SYSTEM_UNKNOWN_ERROR)
      expect(status.message).toBe("unknown error")
    })
  })

  describe("Status.fromBlob", () => {
    it("returns UNKNOWN_ERROR when blob is undefined", async () => {
      const status = await Status.fromBlob(undefined)

      expect(status).toBe(undefined)
    })

    it("returns UNKNOWN_ERROR when blob is not application/json", async () => {
      const blob = new Blob(["hello"], {
        type: "text/plain",
      })

      const status = await Status.fromBlob(blob)

      expect(status?.code).toBe(StatusCode.SYSTEM_UNKNOWN_ERROR)
      expect(status?.message).toBe("data not supported")
    })

    it("returns status parsed from json blob", async () => {
      // Arrange
      const payload = {
        status: {
          code: "VALIDATION.INVALID_PARAM",
          message: "Validation failed",
        },
        validation_errors: {
          name: [
            {
              code: "VALIDATION.REQUIRED",
              message: "Name is required",
            },
          ],
        },
      }

      const textMock = vi.fn().mockResolvedValue(
        JSON.stringify(payload),
      )

      const blob = {
        type: "application/json",
        text: textMock,
      } as unknown as Blob

      const spy = vi.spyOn(Status, "fromObject")

      // Act
      await Status.fromBlob(blob)

      // Assert
      expect(textMock).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(payload)

      spy.mockRestore()
    })

    it("accepts application/json with charset", async () => {
      const payload = {
        status: {
          code: "VALIDATION.INVALID_PARAM",
          message: "Validation failed",
        },
        validation_errors: {
          name: [
            {
              code: "VALIDATION.REQUIRED",
              message: "Name is required",
            },
          ],
        },
      }

      const blob = {
        type: "application/json;charset=utf-8",
        text: vi.fn().mockResolvedValue(
          JSON.stringify(payload),
        ),
      } as unknown as Blob

      const spy = vi.spyOn(Status, "fromObject")

      await Status.fromBlob(blob)

      expect(spy).toHaveBeenCalledWith(payload)

      spy.mockRestore()
    })

    it("throws when blob contains invalid json", async () => {
      const blob = {
        type: "application/json",
        text: vi.fn().mockImplementation(() => {
          throw new Error("error")
        }),
      } as unknown as Blob

      const stat = await Status.fromBlob(blob)

      expect(stat?.code).toBe("SYSTEM.UNKNOWN_ERROR")
      expect(stat?.message).toBe("error")
    })
  })

  describe("fromResponse static function", () => {
    it("fromResponse() parses successful JSON response", async () => {
      const mockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({
          status: {
            code: StatusCode.SUCCESS,
            message: "ok",
          }
        }),
      } as unknown as Response

      const status = await Status.fromResponse(mockResponse)

      expect(status.code).toBe(StatusCode.SUCCESS)
      expect(status.message).toBe("ok")
    })

    it("fromResponse() uses default message/code when missing", async () => {
      const mockResponse = {
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Response

      const status = await Status.fromResponse(mockResponse)

      expect(status.code).toBe(StatusCode.SYSTEM_INTERNAL_ERROR)
      expect(status.message).toBe("error occured")
    })

    it("fromResponse() parses validation errors on 400", async () => {
      const mockResponse = {
        status: 400,
        json: vi.fn().mockResolvedValue({
          status: {
            code: "VALIDATION.INVALID_PARAM",
            message: "invalid",
          },
          validation_errors: {
            email: [
              {
                code: "required",
                message: "required"
              },
              {
                code: "email",
                message: "email"
              }
            ],
          },
        }),
      } as unknown as Response

      const status = await Status.fromResponse(mockResponse)

      const errors = status.validationErrors.get("email") || []

      expect(errors[0].code).toEqual("required")
      expect(errors[1].code).toEqual("email")
    })

    it("fromResponse() handles JSON parse failure", async () => {
      const mockResponse = {
        status: 500,
        json: vi.fn().mockRejectedValue(new Error("fail")),
      } as unknown as Response

      const status = await Status.fromResponse(mockResponse)

      expect(status.code).toBe(StatusCode.SYSTEM_UNKNOWN_ERROR)
      expect(status.message).toBe("fail")
    })
  })
})