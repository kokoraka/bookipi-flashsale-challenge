import React from "react"

type FieldAlertProps = {
  visible?: boolean
  items?: StatusError[]
}

type StatusError = {
  code: string
  message: string
}

export function FieldAlert(props: FieldAlertProps): React.JSX.Element {
  const {
    items = [],
    visible = false
  } = props

  return (
    visible ?
      <div className="text-sm text-red-600">
        <ul>
          {
            items.map((item, i) => {
              return (
                <li key={`field-${item.code}-error-${i}`}>
                  {item.message}
                </li>
              )
            })
          }
        </ul>
      </div>
      :
      <></>
  )
}