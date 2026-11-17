import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { CardBody } from "./CardBody"

describe("CardBody", () => {
  it("renders children", () => {
    render(
      <CardBody>
        <div>Body Content</div>
      </CardBody>
    )

    expect(screen.getByText("Body Content")).toBeInTheDocument()
  })

  it("applies the expected classes", () => {
    const { container } = render(
      <CardBody>
        <span>Content</span>
      </CardBody>
    )

    const outer = container.firstElementChild
    const inner = outer?.firstElementChild

    expect(outer).toHaveClass(
      "p-4",
      "sm:p-6",
      "border-t",
      "border-gray-100",
      "dark:border-gray-800"
    )

    expect(inner).toHaveClass("space-y-6")
  })

  it("renders without children", () => {
    const { container } = render(<CardBody />)

    const outer = container.firstElementChild
    const inner = outer?.firstElementChild

    expect(outer).toBeInTheDocument()
    expect(inner).toBeInTheDocument()
    expect(inner).toBeEmptyDOMElement()
  })
})