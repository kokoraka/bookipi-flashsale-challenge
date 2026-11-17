import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { ListAlert } from "./ListAlert"

describe("ListAlert", () => {
  it("renders nothing by default", () => {
    const { container } = render(<ListAlert />)

    expect(container).toBeEmptyDOMElement()
  })

  it("renders nothing when visible is false", () => {
    const { container } = render(
      <ListAlert
        visible={false}
        items={[
          {
            code: "ERR001",
            message: "First error",
          },
        ]}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("renders an empty list when visible is true and no items are provided", () => {
    const { container } = render(
      <ListAlert visible />,
    )

    const alert = container.querySelector("div")

    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass(
      "bg-orange-200",
      "p-2",
      "font-medium",
      "text-sm",
      "text-black",
    )

    expect(alert?.querySelectorAll("li")).toHaveLength(0)
  })

  it("renders all error messages", () => {
    render(
      <ListAlert
        visible
        items={[
          {
            code: "ERR001",
            message: "First error",
          },
          {
            code: "ERR002",
            message: "Second error",
          },
        ]}
      />,
    )

    expect(screen.getByText("First error")).toBeInTheDocument()
    expect(screen.getByText("Second error")).toBeInTheDocument()

    expect(screen.getAllByRole("listitem")).toHaveLength(2)
  })

  it("renders duplicate messages", () => {
    render(
      <ListAlert
        visible
        items={[
          {
            code: "ERR001",
            message: "Duplicate",
          },
          {
            code: "ERR002",
            message: "Duplicate",
          },
        ]}
      />,
    )

    expect(screen.getAllByText("Duplicate")).toHaveLength(2)
  })

  it("renders an empty alert when items is an empty array", () => {
    const { container } = render(
      <ListAlert
        visible
        items={[]}
      />,
    )

    expect(container.querySelector("ul")).toBeInTheDocument()
    expect(container.querySelectorAll("li")).toHaveLength(0)
  })
})