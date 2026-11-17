import * as React from "react"
import { To } from "react-router-dom"
import { ButtonLink } from "../../components/Button"

type InfoProps = {
  title?: string
  subtitle?: string
  actionText?: string
  actionTo?: To
}

export function Info(props: Readonly<InfoProps>): React.JSX.Element {
  const {
    title = "404",
    subtitle = "Page not found",
    actionText = "Back",
    actionTo = "/"
  } = props

  return (
    <div aria-label="info">
      <div className="h-screen flex flex-col gap-4 md:gap-8 justify-center items-center">
        <div className="flex flex-col gap-2 md:gap-4 justify-center items-center text-center">
          <h1 className="text-3xl 2xl:text-5xl">
            {title}
          </h1>
          {
            subtitle &&
            <h2 className="text-xl 2xl:text-2xl">
              {subtitle}
            </h2>
          }
        </div>
        <div className="flex flex-col justify-center items-center">
          <ButtonLink to={actionTo}>
            {actionText}
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}