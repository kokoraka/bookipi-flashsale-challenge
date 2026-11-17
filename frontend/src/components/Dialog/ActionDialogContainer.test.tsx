import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { act, render } from "@testing-library/react"
import { ActionDialogContainer } from "./ActionDialogContainer"
import { useDialogStore } from "./dialog.store"
import type { ActionDialogProps } from "./ActionDialog"

const ActionDialogMock = vi.fn<(props: ActionDialogProps) => React.JSX.Element>(
  () => <div data-testid="action-dialog" />
)

vi.mock("./ActionDialog", () => ({
  ActionDialog: (props: ActionDialogProps) => ActionDialogMock(props),
}))

describe("ActionDialogContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    useDialogStore.setState({
      queue: [],
    })
  })

  it("should render nothing when queue is empty", () => {
    const { container } = render(<ActionDialogContainer />)

    expect(container).toBeEmptyDOMElement()
    expect(ActionDialogMock).not.toHaveBeenCalled()
  })

  it("should render ActionDialog with current props", () => {
    const resolve = vi.fn()

    useDialogStore.getState().push({
      id: "1",
      props: {
        title: "Delete item",
        content: "Are you sure?",
      },
      resolve,
    })

    render(<ActionDialogContainer />)

    expect(ActionDialogMock).toHaveBeenCalledTimes(1)

    const props = ActionDialogMock.mock.calls[0][0]

    expect(props.title).toBe("Delete item")
    expect(props.content).toBe("Are you sure?")
    expect(props.opened).toBe(true)
    expect(props.onConfirm).toBeTypeOf("function")
    expect(props.onClose).toBeTypeOf("function")
  })

  it("should resolve confirmed=true and pop on confirm", () => {
    const resolve = vi.fn()

    useDialogStore.getState().push({
      id: "1",
      props: {},
      resolve,
    })

    render(<ActionDialogContainer />)

    const props = ActionDialogMock.mock.calls[0][0]

    act(() => {
      props.onConfirm?.()
    })

    expect(resolve).toHaveBeenCalledWith({
      confirmed: true,
    })

    expect(useDialogStore.getState().queue).toHaveLength(0)
  })

  it("should resolve confirmed=false and pop on close", () => {
    const resolve = vi.fn()

    useDialogStore.getState().push({
      id: "1",
      props: {},
      resolve,
    })

    render(<ActionDialogContainer />)

    const props = ActionDialogMock.mock.calls[0][0]

    act(() => {
      props.onClose?.()
    })

    expect(resolve).toHaveBeenCalledWith({
      confirmed: false,
    })

    expect(useDialogStore.getState().queue).toHaveLength(0)
  })

  it("should only render the first dialog in the queue", () => {
    useDialogStore.getState().push({
      id: "1",
      props: {
        title: "First",
      },
      resolve: vi.fn(),
    })

    useDialogStore.getState().push({
      id: "2",
      props: {
        title: "Second",
      },
      resolve: vi.fn(),
    })

    render(<ActionDialogContainer />)

    const props = ActionDialogMock.mock.calls[0][0]

    expect(props.title).toBe("First")
  })
})