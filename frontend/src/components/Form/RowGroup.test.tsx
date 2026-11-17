import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { RowGroup } from "./RowGroup"

describe("RowGroup", () => {
  it("renders children", () => {
    render(
      <RowGroup>
        <span>First Child</span>
        <button>Click Me</button>
      </RowGroup>
    )

    expect(screen.getByText("First Child")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Click Me" })
    ).toBeInTheDocument()
  })

  it("renders an empty container when no children are provided", () => {
    const { container } = render(<RowGroup />)

    const wrapper = container.firstChild

    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toBeEmptyDOMElement()
  })

  it("applies the expected layout classes", () => {
    const { container } = render(<RowGroup />)

    expect(container.firstChild).toHaveClass(
      "flex",
      "flex-col",
      "gap-1"
    )
  })
})