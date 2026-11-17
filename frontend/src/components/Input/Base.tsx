import * as React from "react"

type BaseProps = {
  type: string
  id?: string
  name?: string
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"
  style?: React.CSSProperties
  className?: string
  placeholder?: string
  defaultValue?: string | number | ReadonlyArray<string>
  value?: string | ReadonlyArray<string> | number
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void
}

export function Base(props: Readonly<BaseProps>): React.JSX.Element {
  const {
    required = false,
    disabled = false,
    readOnly = false,
    className = "",
    onInput = () => { },
    onChange = () => { },
    onBlur = () => { },
  } = props

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    onInput?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    onBlur?.(e)
  }

  return (
    <input
      type={props.type}
      inputMode={props.inputMode}
      id={props.id}
      name={props.name}
      placeholder={props.placeholder}
      style={props.style}
      className={className}
      defaultValue={props.defaultValue}
      value={props.value}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      onInput={handleInput}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}
