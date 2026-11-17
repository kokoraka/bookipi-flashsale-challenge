import { describe, it, expect, beforeEach, vi } from "vitest"
import { useDialogStore } from "./dialog.store"

describe("useDialogStore", () => {
  beforeEach(() => {
    useDialogStore.setState({
      queue: [],
    })
  })

  it("should initialize with an empty queue", () => {
    expect(useDialogStore.getState().queue).toEqual([])
  })

  it("should push an item into the queue", () => {
    const resolve = vi.fn()

    const item = {
      id: "1",
      props: {
        title: "Delete Item",
      },
      resolve,
    }

    useDialogStore.getState().push(item)

    expect(useDialogStore.getState().queue).toEqual([item])
  })

  it("should push multiple items in order", () => {
    const first = {
      id: "1",
      props: {
        title: "First",
      },
      resolve: vi.fn(),
    }

    const second = {
      id: "2",
      props: {
        title: "Second",
      },
      resolve: vi.fn(),
    }

    useDialogStore.getState().push(first)
    useDialogStore.getState().push(second)

    expect(useDialogStore.getState().queue).toEqual([
      first,
      second,
    ])
  })

  it("should pop the first item from the queue", () => {
    const first = {
      id: "1",
      props: {
        title: "First",
      },
      resolve: vi.fn(),
    }

    const second = {
      id: "2",
      props: {
        title: "Second",
      },
      resolve: vi.fn(),
    }

    useDialogStore.getState().push(first)
    useDialogStore.getState().push(second)

    useDialogStore.getState().pop()

    expect(useDialogStore.getState().queue).toEqual([second])
  })

  it("should pop until the queue is empty", () => {
    useDialogStore.getState().push({
      id: "1",
      props: {},
      resolve: vi.fn(),
    })

    useDialogStore.getState().pop()

    expect(useDialogStore.getState().queue).toEqual([])
  })

  it("should not throw when popping an empty queue", () => {
    expect(() => {
      useDialogStore.getState().pop()
    }).not.toThrow()

    expect(useDialogStore.getState().queue).toEqual([])
  })

  it("should preserve resolve function", () => {
    const resolve = vi.fn()

    const item = {
      id: "1",
      props: {},
      resolve,
    }

    useDialogStore.getState().push(item)

    expect(useDialogStore.getState().queue[0].resolve).toBe(resolve)
  })
})