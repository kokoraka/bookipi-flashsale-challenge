import { describe, expect, it, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { ToastContainer } from "./Container"

const toastContainerMock = vi.fn()

vi.mock("react-toastify", () => ({
  ToastContainer: (props: unknown) => {
    toastContainerMock(props)
    return <div data-testid="toast-container" />
  },
}))

describe("ToastContainer", () => {
  beforeEach(() => {
    toastContainerMock.mockClear()
  })

  it("renders the underlying ToastContainer", () => {
    const { getByTestId } = render(<ToastContainer />)

    expect(getByTestId("toast-container")).toBeInTheDocument()
  })

  it("passes an undefined position by default", () => {
    render(<ToastContainer />)

    expect(toastContainerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        position: undefined,
      }),
    )
  })

  it.each([
    "top-right",
    "top-center",
    "top-left",
    "bottom-right",
    "bottom-center",
    "bottom-left",
  ] as const)("passes the %s position", (position) => {
    render(<ToastContainer position={position} />)

    expect(toastContainerMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        position,
      }),
    )
  })
})