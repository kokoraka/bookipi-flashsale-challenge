import React from "react"

type RowGroupProps = {
  children?: React.ReactNode
}

export function RowGroup(props: Readonly<RowGroupProps>): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      {props.children}
    </div>
  )
}