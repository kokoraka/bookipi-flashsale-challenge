import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { Alert } from "./Alert"
import { AlertVariant } from "./Resource"

describe("Alert", () => {
  it("renders nothing when opened is false", () => {
    const { container } = render(<Alert />)

    expect(container).toBeEmptyDOMElement()
  })

  it("renders the header and content when opened", () => {
    render(
      <Alert
        opened
        children={{
          header: "Success",
          content: "Data has been saved.",
        }}
      />
    )

    expect(screen.getByText("Success")).toBeInTheDocument()
    expect(screen.getByText("Data has been saved.")).toBeInTheDocument()
  })

  it("renders only the header when content is not provided", () => {
    render(
      <Alert
        opened
        children={{
          header: "Header Only",
        }}
      />
    )

    expect(screen.getByText("Header Only")).toBeInTheDocument()
    expect(screen.queryByText("Content")).not.toBeInTheDocument()
  })

  it("renders only the content when header is not provided", () => {
    render(
      <Alert
        opened
        children={{
          content: "Content Only",
        }}
      />
    )

    expect(screen.getByText("Content Only")).toBeInTheDocument()
  })

  it("does not render the close icon when closeAble is false", () => {
    const { container } = render(
      <Alert
        opened
        children={{
          content: "Hello",
        }}
      />
    )

    expect(container.querySelector("svg")).toBeNull()
  })

  it("renders the close icon when closeAble is true", () => {
    const { container } = render(
      <Alert
        opened
        closeAble
        children={{
          content: "Hello",
        }}
      />
    )

    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("calls onClose when clicking the close icon", () => {
    const onClose = vi.fn()

    const { container } = render(
      <Alert
        opened
        closeAble
        onClose={onClose}
        children={{
          content: "Hello",
        }}
      />
    )

    fireEvent.click(container.querySelector("svg")!)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("uses the default onClose handler when none is provided", () => {
    const { container } = render(
      <Alert
        opened
        closeAble
        children={{
          content: "Hello",
        }}
      />
    )

    expect(() =>
      fireEvent.click(container.querySelector("svg")!)
    ).not.toThrow()
  })

  it("applies the correct variant classes", () => {
    const { container } = render(
      <Alert
        opened
        variant={AlertVariant.SUCCESS}
        children={{
          content: "Success",
        }}
      />
    )

    const alert = container.firstElementChild

    expect(alert?.className).toContain("border")
  })
})