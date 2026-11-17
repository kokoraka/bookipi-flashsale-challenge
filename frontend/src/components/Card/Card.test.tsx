import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { Card } from "./Card"

describe("Card", () => {
  it("renders children", () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    )

    expect(screen.getByText("Card Content")).toBeInTheDocument()
  })

  it("applies the expected classes", () => {
    const { container } = render(
      <Card>
        <span>Content</span>
      </Card>
    )

    const card = container.firstElementChild

    expect(card).toHaveClass(
      "w-full",
      "rounded-2xl",
      "border",
      "border-gray-200",
      "bg-white",
      "dark:border-gray-800",
      "dark:bg-gray-900"
    )
  })

  it("renders without children", () => {
    const { container } = render(<Card />)

    expect(container.firstElementChild).toBeInTheDocument()
    expect(container.firstElementChild).toBeEmptyDOMElement()
  })
})