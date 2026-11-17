import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { useToast, createContainer } from "./toast"

vi.mock("react-toastify", () => {
  return {
    toast: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
    },
    ToastContainer: ({ position }: { position?: string }) => (
      <div data-testid="toast-container" data-position={position} />
    ),
  }
})

import { toast } from "react-toastify"
const toastMock = vi.mocked(toast)

describe("useToast", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call toast.info", () => {
    const toast = useToast()

    toast.info("Hello")

    expect(toastMock.info).toHaveBeenCalledWith("Hello", {
      autoClose: undefined,
      delay: undefined,
    })
  })

  it("should call toast.warn", () => {
    const toast = useToast()

    toast.warn("Warning")

    expect(toastMock.warn).toHaveBeenCalledWith("Warning", {
      autoClose: undefined,
      delay: undefined,
    })
  })

  it("should call toast.error", () => {
    const toast = useToast()

    toast.error("Error")

    expect(toastMock.error).toHaveBeenCalledWith("Error", {
      autoClose: undefined,
      delay: undefined,
    })
  })

  it("should call toast.success", () => {
    const toast = useToast()

    toast.success("Success")

    expect(toastMock.success).toHaveBeenCalledWith("Success", {
      autoClose: undefined,
      delay: undefined,
    })
  })

  it("should map appearDelay to autoClose", () => {
    const toast = useToast()

    toast.success("Done", {
      appearDelay: 3000,
    })

    expect(toastMock.success).toHaveBeenCalledWith("Done", {
      autoClose: 3000,
      delay: undefined,
    })
  })

  it("should map closeDelay to delay", () => {
    const toast = useToast()

    toast.info("Hello", {
      closeDelay: 1000,
    })

    expect(toastMock.info).toHaveBeenCalledWith("Hello", {
      autoClose: undefined,
      delay: 1000,
    })
  })

  it("should merge default props with override props", () => {
    const toast = useToast({
      appearDelay: 5000,
      closeDelay: 200,
    })

    toast.success("Done", {
      appearDelay: 1000,
      closeDelay: 50,
    })

    expect(toastMock.success).toHaveBeenCalledWith("Done", {
      appearDelay: 5000,
      closeDelay: 200,
      autoClose: 1000,
      delay: 50,
    })
  })
})

describe("createContainer", () => {
  it("should render ToastContainer with default position", () => {
    const { getByTestId } = render(createContainer())

    expect(getByTestId("toast-container")).toBeInTheDocument()
  })

  it("should render ToastContainer with provided position", () => {
    const { getByTestId } = render(
      createContainer({
        position: "bottom-center",
      })
    )

    expect(getByTestId("toast-container")).toHaveAttribute(
      "data-position",
      "bottom-center"
    )
  })
})