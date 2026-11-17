import * as React from "react"
import { ToastContainer as RToastContainer } from "react-toastify"

type ToastContainerProps = {
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left"
}

export function ToastContainer(props: Readonly<ToastContainerProps>): React.JSX.Element {
  const {
    position,
  } = props

  return (
    <RToastContainer position={position} />
  )
}