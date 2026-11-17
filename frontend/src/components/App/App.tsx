import * as React from "react"
import { Suspense } from "react"
import { RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "../Theme"
import { MetaProvider } from "../Meta"
import { Spinner } from "../Spinner"
import { router } from "./routes"
import "./App.css"

const meta = {
  titleTemplate: "Flashsale - %s",
  titleFallback: "Flashsale",
  descriptionFallback: "Coding challenge",
  typeFallback: "website",
  urlFallback: `${import.meta.env.VITE_PUBLIC_URL}${window.location.pathname}`,
}

const queryClient = new QueryClient()

export default function App(): React.JSX.Element {
  return (
    <Suspense fallback={
      <div className="h-screen flex justify-center items-center">
        <Spinner label="Loading..." labeled />
      </div>
    }>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MetaProvider meta={meta}>
            <RouterProvider router={router} />
          </MetaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Suspense>
  )
}