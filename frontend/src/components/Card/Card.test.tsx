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
})