import * as React from "react"
import { Info } from "../features/Page"
import { Meta } from "../components/Meta"
import { ButtonLink } from "../components/Button"
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
        <div className="h-screen flex flex-col gap-4 md:gap-8 justify-center items-center">
          <Info
            title={'404'}
            subtitle={'Page Not Found'} />
          <div className="flex flex-col justify-center items-center">
            <ButtonLink to={`/`}>
              Back to Home
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  )
}