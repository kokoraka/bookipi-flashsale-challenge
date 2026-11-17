import * as React from "react"
import { HiXMark } from "react-icons/hi2"
import {
  AlertVariant,
  AlertVariantProps,
  AlertStyle
} from "./Resource"

type AlertProps = {
  children?: {
    header?: React.ReactNode
    content?: React.ReactNode
  }
  variant?: AlertVariantProps
  opened?: boolean
  closeAble?: boolean
  onClose?: () => void
}

const styleBuilder = new AlertStyle()

export function Alert(props: Readonly<AlertProps>): React.JSX.Element {
  const {
    opened = false,
    closeAble = false,
    variant = AlertVariant.INFO,
    onClose = () => { },
    children,
  } = props

  const handleClose = () => {
    if (!closeAble) {
      return
    }

    onClose?.()
  }

  const styler = styleBuilder.setVariant(variant)
  const containerClass = styler.buildContainer()
  const itemClass = styler.buildTitle()

  return (
    <>
      {
        opened &&
        <div className={containerClass}>
          <div className="flex justify-start items-center w-full">
            <div>
              {
                children?.header &&
                <div className={itemClass}>
                  {children.header}
                </div>
              }
              {
                children?.content &&
                <div className="text-sm text-slate-800">
                  {children.content}
                </div>
              }
            </div>
          </div>

          {
            closeAble &&
            <div className="flex justify-end items-center">
              <HiXMark onClick={handleClose} className="cursor-pointer rounded-full w-5 h-5 ml-2" aria-hidden="true" />
            </div>
          }
        </div>
      }
    </>
  )
}
