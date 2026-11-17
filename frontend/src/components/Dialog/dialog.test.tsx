import { describe, it, expect, vi, beforeEach } from "vitest"
import { dialog, useActionDialog } from "./dialog"
import { DialogVariant } from "./Resource"
import { useDialogStore } from "./dialog.store"

vi.mock("./dialog.store", () => ({
  useDialogStore: {
    getState: vi.fn(),
  },
}))

describe("dialog", () => {
  const push = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-123")

    vi.mocked(useDialogStore.getState).mockReturnValue({
      queue: [],
      push,
      pop: vi.fn(),
    })
  })

  it("should push a dialog into the store", () => {
    dialog.show({
      title: "Delete Item",
    })

    expect(push).toHaveBeenCalledTimes(1)

    const item = push.mock.calls[0][0]

    expect(item.id).toBe("uuid-123")
    expect(item.props).toEqual({
      title: "Delete Item",
    })
    expect(item.resolve).toBeTypeOf("function")
  })

  it.each([
    ["primary", DialogVariant.PRIMARY],
    ["secondary", DialogVariant.SECONDARY],
    ["info", DialogVariant.INFO],
    ["success", DialogVariant.SUCCESS],
    ["warning", DialogVariant.WARNING],
    ["danger", DialogVariant.DANGER],
  ])("should create %s dialog", (method, variant) => {
    dialog[method as keyof typeof dialog]({
      title: "Hello",
    })

    expect(push).toHaveBeenCalledTimes(1)

    const item = push.mock.calls[0][0]

    expect(item.props).toEqual({
      title: "Hello",
      variant,
    })
  })

  it("should return the dialog API from useActionDialog", () => {
    expect(useActionDialog()).toBe(dialog)
  })

  it("should resolve promise when resolve callback is invoked", async () => {
    const promise = dialog.show({
      title: "Delete",
    })

    const item = push.mock.calls[0][0]

    item.resolve({
      confirmed: true,
    })

    await expect(promise).resolves.toEqual({
      confirmed: true,
    })
  })

  it("should resolve false result", async () => {
    const promise = dialog.show({
      title: "Delete",
    })

    const item = push.mock.calls[0][0]

    item.resolve({
      confirmed: false,
    })

    await expect(promise).resolves.toEqual({
      confirmed: false,
    })
  })
})