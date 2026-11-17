import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { CardHeader } from "./CardHeader"

describe("CardHeader", () => {
  it("renders children", () => {
    render(
      <CardHeader>
        <h2>Card Title</h2>
      </CardHeader>
    )

    expect(screen.getByText("Card Title")).toBeInTheDocument()
  })

  it("applies the expected classes", () => {
    const { container } = render(
      <CardHeader>
        <span>Content</span>
      </CardHeader>
    )

    expect(container.firstElementChild).toHaveClass(
      "px-6",
      "py-5"
    )
  })

  it("renders without children", () => {
    const { container } = render(<CardHeader />)

    expect(container.firstElementChild).toBeInTheDocument()
    expect(container.firstElementChild).toBeEmptyDOMElement()
  })
})