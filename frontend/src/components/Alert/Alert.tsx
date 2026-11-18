import * as React from "react"
import { HiXMark } from "react-icons/hi2"
import {
  AlertVariant,
  AlertVariantProps,
} from "./Resource"
import { cva } from "class-variance-authority"

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

  return (
    <>
      {
        opened &&
        <div className={container({ variant })}>
          <div className="flex justify-start items-center w-full">
            <div>
              {
                children?.header &&
                <div className={title({ variant })}>
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

const container = cva(
  "flex flex-row p-5 my-2 rounded border shadow-sm",
  {
    variants: {
      variant: {
        info: "bg-blue-200 border-blue-300",
        success: "bg-green-200 border-green-300",
        warning: "bg-orange-200 border-orange-300",
        danger: "bg-red-200 border-red-300",
        disabled: "bg-gray-200 border-gray-300",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const title = cva(
  "font-semibold text-md",
  {
    variants: {
      variant: {
        info: "text-blue-800",
        success: "text-green-800",
        warning: "text-orange-800",
        danger: "text-red-800",
        disabled: "text-gray-800",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)