import { cva } from "class-variance-authority"
import { BadgeVariantProps } from "./Resource"

type BadgeProps = {
  variant: BadgeVariantProps
  children?: React.ReactNode
}

export function Badge(props: Readonly<BadgeProps>): React.JSX.Element {
  const {
    variant,
    children
  } = props

  return (
    <span className={element({ variant })}>
      {children}
    </span>
  )
}

const element = cva(
  "w-fit p-1 text-sm rounded-md outline outline-none",
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