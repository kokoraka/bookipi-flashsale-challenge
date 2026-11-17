import * as React from "react"
import { Outlet } from "react-router-dom"
import { ToastContainer } from "../components/Toast"

export default function Guest(): React.JSX.Element {
  return (
    <div className="font-roboto">
      <ToastContainer position="top-center" />

      <div className="min-h-[calc(100vh-63px-88px)] md:min-h-[calc(100vh-80px-88px)]">
        <Outlet />
      </div>
    </div>
  )
}