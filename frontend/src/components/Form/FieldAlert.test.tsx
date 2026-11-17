import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { FieldAlert } from "./FieldAlert"

describe("FieldAlert", () => {
  it("renders nothing by default", () => {
    const { container } = render(<FieldAlert />)

    expect(container).toBeEmptyDOMElement()
  })

  it("renders nothing when visible is false", () => {
    const { container } = render(
      <FieldAlert
        visible={false}
        items={[
          {
            code: "REQUIRED",
            message: "Name is required",
          },
        ]}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("renders an empty list when visible is true and items is undefined", () => {
    render(<FieldAlert visible />)

    expect(screen.getByRole("list")).toBeInTheDocument()
    expect(screen.queryAllByRole("listitem")).toHaveLength(0)
  })

  it("renders an empty list when visible is true and items is empty", () => {
    render(<FieldAlert visible items={[]} />)

    expect(screen.getByRole("list")).toBeInTheDocument()
    expect(screen.queryAllByRole("listitem")).toHaveLength(0)
  })

  it("renders a single error message", () => {
    render(
      <FieldAlert
        visible
        items={[
          {
            code: "REQUIRED",
            message: "Name is required",
          },
        ]}
      />
    )

    expect(screen.getByText("Name is required")).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
  })

  it("renders multiple error messages", () => {
    render(
      <FieldAlert
        visible
        items={[
          {
            code: "REQUIRED",
            message: "Name is required",
          },
          {
            code: "MIN_LENGTH",
            message: "Name must be at least 3 characters",
          },
        ]}
      />
    )

    expect(screen.getByText("Name is required")).toBeInTheDocument()
    expect(
      screen.getByText("Name must be at least 3 characters")
    ).toBeInTheDocument()

    expect(screen.getAllByRole("listitem")).toHaveLength(2)
  })
})