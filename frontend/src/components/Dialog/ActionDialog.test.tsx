import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ActionDialog } from "./ActionDialog"
import { DialogVariant } from "./Resource"

const OverlayMock = vi.fn()

vi.mock("../Overlay", () => ({
  Overlay: (props: React.PropsWithChildren<{
    opened?: boolean
    onClose?: () => void
  }>) => {
    OverlayMock(props)
    return <div data-testid="overlay">{props.children}</div>
  },
}))

vi.mock("../Spinner", () => ({
  Spinner: ({ size }: { size?: string }) => (
    <div data-testid="spinner" data-size={size} />
  ),
}))

vi.mock("@headlessui/react", () => ({
  Dialog: {
    Title: ({
      children,
      className,
    }: React.PropsWithChildren<{ className?: string }>) => (
      <h3 className={className}>{children}</h3>
    ),
  },
}))

describe("ActionDialog", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render title and content", () => {
    render(
      <ActionDialog
        opened
        title="Delete Item"
        content="Are you sure?"
      />
    )

    expect(screen.getByText("Delete Item")).toBeInTheDocument()
    expect(screen.getByText("Are you sure?")).toBeInTheDocument()
  })

  it("should not render title when omitted", () => {
    render(<ActionDialog opened content="Hello" />)

    expect(
      screen.queryByRole("heading")
    ).not.toBeInTheDocument()
  })

  it("should not render content when omitted", () => {
    render(<ActionDialog opened title="Hello" />)

    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("should render default button labels", () => {
    render(<ActionDialog opened />)

    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: "Cancel" })
    ).toBeInTheDocument()
  })

  it("should render custom button labels", () => {
    render(
      <ActionDialog
        opened
        confirmLabel="Delete"
        cancelLabel="No"
      />
    )

    expect(
      screen.getByRole("button", { name: "Delete" })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: "No" })
    ).toBeInTheDocument()
  })

  it("should call onConfirm", () => {
    const onConfirm = vi.fn()

    render(
      <ActionDialog
        opened
        onConfirm={onConfirm}
      />
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Continue" })
    )

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("should call onClose", () => {
    const onClose = vi.fn()

    render(
      <ActionDialog
        opened
        onClose={onClose}
      />
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Cancel" })
    )

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("should disable both buttons while loading", () => {
    render(
      <ActionDialog
        opened
        loading
      />
    )

    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toBeDisabled()

    expect(
      screen.getByRole("button", { name: "Cancel" })
    ).toBeDisabled()
  })

  it("should render spinner while loading", () => {
    render(
      <ActionDialog
        opened
        loading
      />
    )

    expect(
      screen.getByTestId("spinner")
    ).toBeInTheDocument()

    expect(
      screen.getByTestId("spinner")
    ).toHaveAttribute("data-size", "xs")
  })

  it("should not render spinner when not loading", () => {
    render(<ActionDialog opened />)

    expect(
      screen.queryByTestId("spinner")
    ).not.toBeInTheDocument()
  })

  it("should pass opened=true to Overlay", () => {
    render(<ActionDialog opened />)

    expect(OverlayMock).toHaveBeenCalled()

    const props = OverlayMock.mock.calls[0][0]

    expect(props.opened).toBe(true)
  })

  it("should prevent overlay close while loading", () => {
    const onClose = vi.fn()

    render(
      <ActionDialog
        opened
        loading
        onClose={onClose}
      />
    )

    const props = OverlayMock.mock.calls[0][0]

    expect(props.onClose).toBe(onClose)
  })

  it("should allow overlay close when not loading", () => {
    const onClose = vi.fn()

    render(
      <ActionDialog
        opened
        loading={false}
        onClose={onClose}
      />
    )

    const props = OverlayMock.mock.calls[0][0]

    expect(props.onClose).toBeUndefined()
  })

  it.each([
    [DialogVariant.PRIMARY, "bg-simple-primary-hover", "text-simple-primary"],
    [DialogVariant.SECONDARY, "bg-simple-secondary-hover", "text-simple-secondary"],
    [DialogVariant.INFO, "bg-blue-500/10", "text-blue-500"],
    [DialogVariant.SUCCESS, "bg-green-500/10", "text-green-600"],
    [DialogVariant.DANGER, "bg-red-500/10", "text-red-600"],
    [DialogVariant.WARNING, "bg-amber-500/10", "text-amber-600"],
  ])(
    "should render %s variant styles",
    (variant, containerClass, iconClass) => {
      const { container } = render(
        <ActionDialog
          opened
          variant={variant}
        />
      )

      expect(
        container.querySelector(`.${containerClass.replaceAll(":", "\\:").replaceAll("/", "\\/")}`)
      ).toBeTruthy()

      expect(
        container.querySelector(`.${iconClass.replaceAll(":", "\\:")}`)
      ).toBeTruthy()
    }
  )

  it("should render default primary variant", () => {
    const { container } = render(
      <ActionDialog opened />
    )

    expect(
      container.querySelector(".bg-simple-primary-hover")
    ).toBeTruthy()

    expect(
      container.querySelector(".text-simple-primary")
    ).toBeTruthy()
  })
})
