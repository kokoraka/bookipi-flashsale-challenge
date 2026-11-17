import * as React from "react"
import { Outlet } from "react-router-dom"
import { ToastContainer } from "../components/Toast"

export default function Guest(): React.JSX.Element {
  return (
    <div className="font-roboto">
      <ToastContainer position="top-center" />

      <div className="min-h-[calc(100vh)]">
        <Outlet />
      </div>
    </div>
  )
}