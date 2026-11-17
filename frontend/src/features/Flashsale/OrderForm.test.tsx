
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { OrderForm } from "./OrderForm"

vi.mock("../../components/Button", () => ({
  Button: ({
    children,
    disabled,
    type,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    appendClassNames?: string
  }) => (
    <button
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}))

vi.mock("../../components/Form", () => ({
  RowGroup: ({
    children,
  }: {
    children: React.ReactNode
  }) => <div>{children}</div>,
}))

vi.mock("../../components/Input", () => ({
  InputText: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}))

describe("OrderForm", () => {
  const mockOnChange = vi.fn()
  const mockOnSubmit = vi.fn()

  const defaultData = {
    email: "john@example.com",
    name: "John Doe",
  }

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof OrderForm>> = {},
  ) => {
    return render(
      <OrderForm
        data={defaultData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        {...props}
      />,
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("should render email input", () => {
      renderComponent()

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it("should render name input", () => {
      renderComponent()

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })

    it("should render email and name values", () => {
      renderComponent()

      expect(screen.getByLabelText(/email/i)).toHaveValue(
        defaultData.email,
      )

      expect(screen.getByLabelText(/name/i)).toHaveValue(
        defaultData.name,
      )
    })

    it("should render buy now button", () => {
      renderComponent()

      expect(
        screen.getByRole("button", { name: /buy now/i }),
      ).toBeInTheDocument()
    })

    it("should render empty values when data is undefined", () => {
      renderComponent({
        data: undefined,
      })

      expect(screen.getByLabelText(/email/i)).toHaveValue("")
      expect(screen.getByLabelText(/name/i)).toHaveValue("")
    })
  })

  describe("Input", () => {
    describe("When email changes", () => {
      it("should call onChange with updated email", () => {
        renderComponent()

        fireEvent.change(screen.getByLabelText(/email/i), {
          target: {
            value: "jane@example.com",
          },
        })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith({
          email: "jane@example.com",
          name: defaultData.name,
        })
      })
    })

    describe("When name changes", () => {
      it("should call onChange with updated name", () => {
        renderComponent()

        fireEvent.change(screen.getByLabelText(/name/i), {
          target: {
            value: "Jane Doe",
          },
        })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith({
          email: defaultData.email,
          name: "Jane Doe",
        })
      })
    })

    describe("When disabled", () => {
      it("should disable email input", () => {
        renderComponent({
          disabled: true,
        })

        expect(screen.getByLabelText(/email/i)).toBeDisabled()
      })

      it("should disable name input", () => {
        renderComponent({
          disabled: true,
        })

        expect(screen.getByLabelText(/name/i)).toBeDisabled()
      })

      it("should disable buy now button", () => {
        renderComponent({
          disabled: true,
        })

        expect(
          screen.getByRole("button", { name: /buy now/i }),
        ).toBeDisabled()
      })
    })

    describe("When enabled", () => {
      it("should enable email input", () => {
        renderComponent()

        expect(screen.getByLabelText(/email/i)).toBeEnabled()
      })

      it("should enable name input", () => {
        renderComponent()

        expect(screen.getByLabelText(/name/i)).toBeEnabled()
      })

      it("should enable buy now button", () => {
        renderComponent()

        expect(
          screen.getByRole("button", { name: /buy now/i }),
        ).toBeEnabled()
      })
    })

    it("should mark email input as required", () => {
      renderComponent()

      expect(screen.getByLabelText(/email/i)).toBeRequired()
    })

    it("should mark name input as required", () => {
      renderComponent()

      expect(screen.getByLabelText(/name/i)).toBeRequired()
    })
  })

  describe("Form Submission", () => {
    it("should call onSubmit when buy now button is clicked", () => {
      renderComponent()

      fireEvent.click(
        screen.getByRole("button", { name: /buy now/i }),
      )

      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    it("should prevent default form submission", () => {
      renderComponent()

      const form = screen.getByRole("button", {
        name: /buy now/i,
      }).closest("form")

      const event = new Event("submit", {
        bubbles: true,
        cancelable: true,
      })

      form?.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
    })

    it("should not call onSubmit when button is disabled", () => {
      renderComponent({
        disabled: true,
      })

      fireEvent.click(
        screen.getByRole("button", { name: /buy now/i }),
      )

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe("Optional Callbacks", () => {
    it("should not throw when onChange is undefined", () => {
      renderComponent({
        onChange: undefined,
      })

      expect(() => {
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: {
            value: "jane@example.com",
          },
        })
      }).not.toThrow()
    })

    it("should not throw when onSubmit is undefined", () => {
      renderComponent({
        onSubmit: undefined,
      })

      expect(() => {
        fireEvent.click(
          screen.getByRole("button", { name: /buy now/i }),
        )
      }).not.toThrow()
    })
  })
})
