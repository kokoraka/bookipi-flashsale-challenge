import * as React from "react"
import { useLocation, useRouteError, isRouteErrorResponse } from "react-router-dom"
import { Status, StatusCode } from "./../status"
import { Meta } from "../components/Meta"
import { ButtonLink } from "../components/Button"
import { Container } from "../components/Container"
import { Info } from "../features/Page"

export default function ErrorPage(): React.JSX.Element {
  const [status, setStatus] = React.useState({
    code: 'Unexpected error',
    message: 'Please try again later'
  })
  const { pathname } = useLocation()
  const error = useRouteError()

  React.useEffect(() => {
    const stat = parseError(error)
    setStatus((prevState) => {
      return {
        ...prevState,
        code: `${stat.code}`,
        message: stat.message
      }
    })
  }, [error])

  return (
    <>
      <Meta>
        {{
          title: status.message
        }}
      </Meta>

      <Container size="md">
        <div className="h-screen flex flex-col gap-4 md:gap-8 justify-center items-center">
          <Info
            title={`${status.code}`}
            subtitle={status.message} />
          <div className="flex flex-col justify-center items-center">
            <ButtonLink to={pathname}>
              Try Again
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  )
}

function parseError(error: unknown): Status {
  if (error instanceof Status) {
    return error
  } else if (error instanceof Error) {
    return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, error.message)
  } else if (isRouteErrorResponse(error)) {
    return new Status(error.status.toString(), error.statusText)
  }
  return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, "Unexpected error happened")
}