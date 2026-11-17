import React from "react"
import { ActionDialog } from "./ActionDialog"
import { useDialogStore } from "./dialog.store"

export function ActionDialogContainer(): React.JSX.Element {
  const queue = useDialogStore((s) => s.queue)
  const pop = useDialogStore((s) => s.pop)

  const current = queue[0]

  if (!current) {
    return <></>
  }

  return (
    <ActionDialog
      {...current.props}
      opened
      onConfirm={() => {
        current.resolve({
          confirmed: true
        })
        pop()
      }}
      onClose={() => {
        current.resolve({
          confirmed: false
        })
        pop()
      }}
    />
  )
}