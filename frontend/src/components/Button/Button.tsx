/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react"
import {
  ButtonTypeProps,
  ButtonType,
  ButtonVariantProps,
  ButtonVariant,
  ButtonSizeProps,
  ButtonSize,
  ButtonThemeProps,
  ButtonTheme,
  ButtonStyle
} from "./Resource"
import {
  ThemeContext
} from "./../Theme"

type ButtonProps = {
  children?: React.ReactNode
  theme?: ButtonThemeProps
  type?: ButtonTypeProps
  variant?: ButtonVariantProps
  size?: ButtonSizeProps
  disabled?: boolean
  appendClassNames?: string
  style?: React.CSSProperties
  onClick?: () => void
}

const styleBuilder = new ButtonStyle()

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref): React.JSX.Element => {
    const themeCtx = React.useContext(ThemeContext)

    const {
      theme = themeCtx.theme || ButtonTheme.DEFAULT,
      variant = ButtonVariant.PRIMARY,
      size = ButtonSize.MEDIUM,
      type = ButtonType.BUTTON,
    } = props

    const {
      appendClassNames,
      ...buttonProps
    } = props

    const handleClick = () => {
      props.onClick?.()
    }

    const styleClassNames = styleBuilder
      .setTheme(theme)
      .setVariant(variant)
      .setSize(size)
      .setDisabled(props.disabled)
      .appendClassNames(props.appendClassNames)
      .build()

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        className={styleClassNames}
        disabled={props.disabled}
        style={props.style}
        {...buttonProps}>
        {props.children}
      </button>
    )
  }
)

Button.displayName = "Button"