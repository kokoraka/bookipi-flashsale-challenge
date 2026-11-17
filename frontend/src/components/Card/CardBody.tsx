import React from "react"

type CardBodyProps = {
  children?: React.ReactNode;
}

export function CardBody(props: Readonly<CardBodyProps>): React.JSX.Element {
  const {
    children
  } = props

  return (
    <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800">
      <div className="space-y-6">{children}</div>
    </div>
  )
}