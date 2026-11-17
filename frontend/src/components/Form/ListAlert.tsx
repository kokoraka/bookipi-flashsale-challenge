import React from "react"

type ListAlertProps = {
  visible?: boolean
  items?: StatusError[]
}

type StatusError = {
  code: string
  message: string
}

export function ListAlert(props: ListAlertProps): React.JSX.Element {
  const {
    items = [],
    visible = false
  } = props

  return (
    visible ?
      <div className="bg-orange-200 p-2 font-medium text-sm text-black">
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