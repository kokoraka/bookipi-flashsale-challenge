import { render, screen } from "@testing-library/react"
import { CardFooter } from "./CardFooter"

describe("CardFooter", () => {
  it("should render without crashing", () => {
    const { container } = render(<CardFooter />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it("should render children", () => {
    render(
      <CardFooter>
        <button>Save</button>
      </CardFooter>
    )

    expect(
      screen.getByRole("button", { name: "Save" })
    ).toBeInTheDocument()
  })

  it("should apply the correct classes", () => {
    const { container } = render(<CardFooter />)

    expect(container.firstChild).toHaveClass("px-6", "py-5")
  })

  it("should render multiple children", () => {
    render(
      <CardFooter>
        <span>First</span>
        <span>Second</span>
      </CardFooter>
    )

    expect(screen.getByText("First")).toBeInTheDocument()
    expect(screen.getByText("Second")).toBeInTheDocument()
  })
})