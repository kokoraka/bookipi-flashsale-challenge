/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ButtonLink } from "./ButtonLink"
import { ThemeContext } from "./../Theme"
import { ButtonTheme } from "./Resource"

vi.mock("./../Router", () => ({
  Link: ({
    children,
    hideCrawl,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string;
    hideCrawl?: boolean;
  }) => (
    <a
      href={props.to}
      data-hide={hideCrawl}
      onClick={(e) => {
        e.preventDefault()
        onClick?.(e)
      }}
      data-testid="router-link"
      {...props}
    >
      {children}
    </a>
  ),
}));

describe("ButtonLink", () => {
  const clickMock = vi.fn()

  beforeEach(() => {
    clickMock.mockReset()
  })

  const renderLink = (ui: React.ReactElement, themeValue?: any) => {
    return render(
      <ThemeContext.Provider value={{ theme: themeValue }}>
        {ui}
      </ThemeContext.Provider>,
    )
  }

  it("renders with default props", () => {
    renderLink(<ButtonLink to="/home">Go Home</ButtonLink>, ButtonTheme.DEFAULT)

    const link = screen.getByRole("link")

    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent("Go Home")
  })

  it("calls onClick when clicked", () => {
    renderLink(
      <ButtonLink to="/home" onClick={clickMock}>
        Click Me
      </ButtonLink>,
    )

    fireEvent.click(screen.getByRole("link"))

    expect(clickMock).toHaveBeenCalledTimes(1)
  })

  it("applies default theme styles", () => {
    renderLink(<ButtonLink to="/home">Styled</ButtonLink>, ButtonTheme.DEFAULT)

    const link = screen.getByRole("link")

    expect(link.className).toContain("inline-block")
  })

  it("applies custom class names", () => {
    renderLink(
      <ButtonLink to="/home" appendClassNames="custom-class">
        Custom
      </ButtonLink>,
    )

    const link = screen.getByRole("link")

    expect(link.className).toContain("custom-class")
  })

  it("merges inline style correctly", () => {
    renderLink(
      <ButtonLink to="/home" style={{ color: "red" }}>
        Style
      </ButtonLink>,
    )

    const link = screen.getByRole("link")

    expect(link).toHaveStyle("text-decoration: none")
    expect(link).toHaveStyle("color: rgb(255, 0, 0)")
  })

  it("uses context theme when no theme prop provided", () => {
    renderLink(<ButtonLink to="/home">Context Theme</ButtonLink>, ButtonTheme.DEFAULT)

    const link = screen.getByRole("link")

    expect(link.className).toContain("inline-block")
  })

  it("overrides context theme when theme prop is provided", () => {
    renderLink(
      <ButtonLink to="/home" theme={ButtonTheme.DEFAULT}>
        Override
      </ButtonLink>,
      "other-theme",
    )

    const link = screen.getByRole("link")

    expect(link.className).toContain("inline-block")
  })

  it("passes routing props correctly", () => {
    renderLink(
      <ButtonLink to="/dashboard" target="_blank" hideCrawl>
        Route
      </ButtonLink>,
    )

    const link = screen.getByRole("link")

    expect(link).toHaveAttribute("target", "_blank")
  })
})