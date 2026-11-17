import * as React from "react"
import { useLocation, useRouteError, isRouteErrorResponse } from "react-router-dom"
import { Status, StatusCode } from "./../status"
import { Meta } from "../components/Meta"
import { Container } from "../components/Container"
import { Info } from "../features/Page"

export default function ErrorPage(): React.JSX.Element {
  const [status, setStatus] = React.useState({
    code: 'ERROR',
    message: 'General Error'
  })
  const { pathname } = useLocation()
  const error = useRouteError()

  React.useEffect(() => {
    const st = parseStatus(error)
    setStatus((prevState) => {
      return {
        ...prevState,
        code: `${st.code}`,
        message: st.message
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
        <Info
          title={`${status.code}`}
          subtitle={status.message}
          actionText={'Try Again'}
          actionTo={pathname} />
      </Container>
    </>
  )
}

function parseStatus(error: unknown): Status {
  if (error instanceof Status) {
    return error
  } else if (error instanceof Error) {
    return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, error.message)
  } else if (isRouteErrorResponse(error)) {
    return new Status(error.status.toString(), error.statusText)
  }
  return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, "Unexpected error happened")
}