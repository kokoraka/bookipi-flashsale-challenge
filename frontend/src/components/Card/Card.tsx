import React from "react"

type CardProps = {
  children?: React.ReactNode
  size?: CardSize
}

type CardSize = "md" | "sm"

const cardStyle = new Map<string, string>()
cardStyle.set("lg", "max-w-3xl")
cardStyle.set("md", "max-w-2xl")
cardStyle.set("sm", "max-w-xl")

export function Card(props: Readonly<CardProps>): React.JSX.Element {
  const {
    children,
    size = "md",
  } = props

  const appendClassName = cardStyle.get(size)

  return (
    <div className={`w-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${appendClassName ?? ""}`}>
      {children}
    </div>
  )
}