import { RouteObject, createBrowserRouter } from "react-router-dom"
import Guest from "../../layout/Guest"
import Home from "../../pages/Home"
import NotFound from "../../pages/NotFound"
import ErrorPage from "../../pages/Error"

const publicPages: RouteObject[] = [
  { path: "", element: <Home /> },
  { path: "*", element: <NotFound /> }
]

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Guest />,
    errorElement: <ErrorPage />,
    children: publicPages,
  },
]

export const router = createBrowserRouter(routes)