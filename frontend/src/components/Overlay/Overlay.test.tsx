import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Overlay } from "./Overlay"

const dialogMock = vi.fn()
const transitionMock = vi.fn()
const transitionChildMock = vi.fn()

vi.mock("@headlessui/react", () => ({
  Dialog: Object.assign(
    ({
      children,
      autoCloseAble,
      onClose,
      className,
    }: React.PropsWithChildren<{
      autoCloseAble?: boolean
      onClose?: () => void
      className?: string
    }>) => {
      dialogMock({ onClose, className, autoCloseAble })

      return (
        <div data-testid="dialog">
          <button onClick={onClose}>Close Overlay</button>
          {children}
        </div>
      )
    },
    {
      Panel: ({
        children,
        className,
      }: React.PropsWithChildren<{
        className?: string
      }>) => (
        <div
          data-testid="dialog-panel"
          className={className}
        >
          {children}
        </div>
      ),
    }
  ),

  Transition: Object.assign(
    ({
      children,
      show,
    }: React.PropsWithChildren<{
      show?: boolean
    }>) => {
      transitionMock(show)

      return show ? <>{children}</> : null
    },
    {
      Child: ({
        children,
      }: React.PropsWithChildren) => {
        transitionChildMock()

        return <>{children}</>
      },
    }
  ),
}))

describe("Overlay", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    document.body.innerHTML =
      '<div id="overlay-root"></div>'
  })

  it("should render children into the portal", () => {
    render(
      <Overlay opened>
        <div>Dialog Content</div>
      </Overlay>
    )

    expect(
      screen.getByText("Dialog Content")
    ).toBeInTheDocument()
  })

  it("should render into a custom overlay element", () => {
    document.body.innerHTML =
      '<div id="custom-root"></div>'

    render(
      <Overlay
        opened
        overlayElementId="custom-root"
      >
        <div>Hello</div>
      </Overlay>
    )

    expect(
      document.getElementById("custom-root")
    ).toContainElement(
      screen.getByText("Hello")
    )
  })

  it("should render nothing if overlay root does not exist", () => {
    document.body.innerHTML = ""

    const { container } = render(
      <Overlay opened>
        Hello
      </Overlay>
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("should render when opened is true", () => {
    render(
      <Overlay opened>
        Hello
      </Overlay>
    )

    expect(
      screen.getByText("Hello")
    ).toBeInTheDocument()

    expect(transitionMock).toHaveBeenCalledWith(true)
  })

  it("should not render when opened is false", () => {
    render(
      <Overlay opened={false}>
        Hello
      </Overlay>
    )

    expect(
      screen.queryByText("Hello")
    ).not.toBeInTheDocument()

    expect(transitionMock).toHaveBeenCalledWith(false)
  })

  it("should call onClose", () => {
    const onClose = vi.fn()

    render(
      <Overlay
        opened
        autoCloseAble
        onClose={onClose}
      >
        Hello
      </Overlay>
    )

    fireEvent.click(
      screen.getByText("Close Overlay")
    )

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("should use default onClose", () => {
    render(
      <Overlay opened>
        Hello
      </Overlay>
    )

    expect(() => {
      fireEvent.click(
        screen.getByText("Close Overlay")
      )
    }).not.toThrow()
  })

  it("should render Dialog.Panel", () => {
    render(
      <Overlay opened>
        Hello
      </Overlay>
    )

    expect(
      screen.getByTestId("dialog-panel")
    ).toBeInTheDocument()
  })

  it("should render two Transition.Child components", () => {
    render(
      <Overlay opened>
        Hello
      </Overlay>
    )

    expect(
      transitionChildMock
    ).toHaveBeenCalledTimes(2)
  })

  it("should pass relative z-30 class to Dialog", () => {
    render(
      <Overlay opened>
        Hello
      </Overlay>
    )

    expect(dialogMock).toHaveBeenCalled()

    expect(
      dialogMock.mock.calls[0][0].className
    ).toBe("relative z-30")
  })
})