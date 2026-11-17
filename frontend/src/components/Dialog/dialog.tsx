
import { DialogVariant, DialogVariantProps } from "./Resource"
import { useDialogStore, ShowDialogProps, ShowDialogResult } from "./dialog.store"

function show(props: Readonly<ShowDialogProps>): Promise<ShowDialogResult> {
  return new Promise((resolve) => {
    useDialogStore.getState().push({
      id: crypto.randomUUID(),
      props,
      resolve,
    })
  })
}

const createVariant = (variant: DialogVariantProps) =>
  (props: Readonly<ShowDialogProps>) =>
    show({
      variant,
      ...props,
    })

export const dialog = {
  show,
  primary: createVariant(DialogVariant.PRIMARY),
  secondary: createVariant(DialogVariant.SECONDARY),
  info: createVariant(DialogVariant.INFO),
  success: createVariant(DialogVariant.SUCCESS),
  warning: createVariant(DialogVariant.WARNING),
  danger: createVariant(DialogVariant.DANGER),
}

export function useActionDialog() {
  return dialog
}
