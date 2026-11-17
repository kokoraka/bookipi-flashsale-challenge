import { render, screen } from "@testing-library/react"
import { InputText } from "./InputText"

describe("InputText component", () => {
  describe("when input is rendered", () => {
    it("should render the children", () => {
      render(
        <InputText placeholder="Text placeholder" />
      )

      const input = screen.getByPlaceholderText("Text placeholder", { exact: true })
      expect(input).toBeInTheDocument()
    })
  })
})
