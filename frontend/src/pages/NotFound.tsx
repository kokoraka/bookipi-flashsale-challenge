import * as React from "react"
import { Info } from "../features/Page"
import { Meta } from "../components/Meta"
import { Container } from "../components/Container"

export default function NotFound(): React.JSX.Element {
  return (
    <>
      <Meta>
        {{
          title: 'Error'
        }}
      </Meta>

      <Container size="md">
        <Info
          title={'404'}
          subtitle={'Page Not Found'}
          actionText={'Back to Home'}
          actionTo={'/'} />
      </Container>
    </>
  )
}