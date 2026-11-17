import { render, screen } from "@testing-library/react"
import { Spinner } from "./Spinner"

describe("Spinner component", () => {
  describe("when spinner is rendered", () => {
    it("should render the children", () => {
      render(<Spinner labeled />)

      const text = screen.getByText("Loading...", { exact: true })
      expect(text).toBeInTheDocument()
    })
  })
})
