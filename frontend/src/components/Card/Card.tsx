import React from "react"

type CardProps = {
  children?: React.ReactNode
}

export function Card(props: Readonly<CardProps>): React.JSX.Element {
  const {
    children,
  } = props

  return (
    <div className="max-w-60 rounded-2xl border border-black bg-white p-4 shadow-sm">
      {children}
    </div>
  )
}