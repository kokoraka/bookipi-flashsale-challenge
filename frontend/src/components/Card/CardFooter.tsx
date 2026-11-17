import React from "react"

type CardFooterProps = {
  children?: React.ReactNode;
}

export function CardFooter(props: Readonly<CardFooterProps>): React.JSX.Element {
  const {
    children
  } = props

  return (
    <div className="px-6 py-5">
      {children}
    </div>
  )
}