import * as React from "react"
import { cva } from "class-variance-authority"
import { Base } from "./Base"
import {
  InputSize,
  InputSizeProps
} from "./Resource"

type InputTextThemeProps = ""

type InputTextProps = {
  id?: string
  name?: string
  placeholder?: string
  defaultValue?: string | number | ReadonlyArray<string>
  value?: string | ReadonlyArray<string> | number
  style?: React.CSSProperties
  theme?: InputTextThemeProps
  size?: InputSizeProps
  classNames?: {
    container?: (props: ClassNamesProps) => string
    input?: (props: ClassNamesProps) => string
  }
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  rightChildren?: React.ReactNode
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void
}

type ClassNamesProps = {
  size: string
  disabled: boolean
}

export function InputText(props: Readonly<InputTextProps>): React.JSX.Element {
  const {
    disabled = false,
    loading = false,
    size = InputSize.MEDIUM,
    classNames = {},
    rightChildren,
  } = props

  const {
    container: containerFn,
    input: inputFn,
  } = classNames

  return (
    <div className={(containerFn?.({ size, disabled })) || container()}>
      <Base
        type="text"
        className={(inputFn?.({ size, disabled })) || element({ disabled, loading, size })}
        {...props} />
      {rightChildren}
    </div>
  )
}

const container = cva(
  "w-full border border-slate-300 rounded-md",
)

const element = cva(
  "w-full rounded-md outline outline-none read-only:bg-gray-100",
  {
    variants: {
      loading: {
        true: "animate-pulse bg-gray-200 text-transparent",
      },
      disabled: {
        true: "cursor-not-allowed",
      },
      size: {
        md: "p-2"
      }
    },
    defaultVariants: {
      loading: false,
      disabled: false,
      size: InputSize.MEDIUM,
    },
  }
)