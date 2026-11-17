/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { Button } from "./Button"
import { ThemeContext } from "./../Theme"
import { ButtonTheme } from "./Resource"

describe("Button", () => {
  const clickMock = vi.fn()

  beforeEach(() => {
    clickMock.mockReset()
  })

  const renderButton = (ui: React.ReactElement, themeValue?: any) => {
    return render(
      <ThemeContext.Provider value={{ theme: themeValue }}>
        {ui}
      </ThemeContext.Provider>,
    )
  }

  it("renders with default props", () => {
    renderButton(<Button>Click</Button>, ButtonTheme.DEFAULT)

    const btn = screen.getByRole("button")

    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute("type", "button")
    expect(btn).not.toBeDisabled()
    expect(btn.textContent).toBe("Click")
  })

  it("calls onClick when clicked", () => {
    renderButton(<Button onClick={clickMock}>Click</Button>)

    fireEvent.click(screen.getByRole("button"))

    expect(clickMock).toHaveBeenCalledTimes(1)
  })

  it("applies disabled state correctly", () => {
    renderButton(<Button disabled>Disabled</Button>)

    const btn = screen.getByRole("button")

    expect(btn).toBeDisabled()
  })

  it("applies custom class names", () => {
    renderButton(<Button appendClassNames="custom-class">Test</Button>)

    const btn = screen.getByRole("button")

    expect(btn.className).toContain("custom-class")
  })

  it("uses context theme when no theme prop provided", () => {
    renderButton(<Button>Theme</Button>, ButtonTheme.DEFAULT)

    const btn = screen.getByRole("button")

    expect(btn.className).toContain("inline-block")
  })

  it("overrides theme prop over context", () => {
    renderButton(
      <Button theme={ButtonTheme.DEFAULT}>Override</Button>,
      "something-else",
    )

    const btn = screen.getByRole("button")

    expect(btn.className).toContain("inline-block")
  })

  it("applies correct size and variant styles", () => {
    renderButton(<Button size="lg" variant="success">Styled</Button>)

    const btn = screen.getByRole("button")

    expect(btn.className).toContain("bg-green-600")
    expect(btn.className).toContain("rounded-md")
  })
})