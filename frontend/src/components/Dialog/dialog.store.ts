import { create } from "zustand"
import { ActionDialogProps } from "./ActionDialog"

export type ShowDialogProps = Omit<
  ActionDialogProps,
  "opened" | "onConfirm" | "onClose"
>

export type ShowDialogResult = {
  confirmed: boolean
}

type QueueItem = {
  id: string
  props: ShowDialogProps
  resolve: (r: ShowDialogResult) => void
}

type DialogStore = {
  queue: QueueItem[]
  push: (item: QueueItem) => void
  pop: () => void
}

export const useDialogStore = create<DialogStore>((set) => ({
  queue: [],

  push: (item) =>
    set((state) => ({
      queue: [...state.queue, item],
    })),

  pop: () =>
    set((state) => ({
      queue: state.queue.slice(1),
    })),
}))