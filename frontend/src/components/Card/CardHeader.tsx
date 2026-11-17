import React from "react"

type CardHeaderProps = {
  children?: React.ReactNode;
}

export function CardHeader(props: Readonly<CardHeaderProps>): React.JSX.Element {
  const {
    children
  } = props

  return (
    <div className="px-6 py-5">
      {children}
    </div>
  )
}