import React from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import { Dialog } from "@headlessui/react"
import { Overlay } from "../Overlay"
import { Spinner } from "../Spinner"
import { DialogVariantProps, DialogVariant } from "./Resource"

export type ActionDialogProps = {
  variant?: DialogVariantProps
  title?: React.ReactNode
  content?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  opened?: boolean
  loading?: boolean
  onConfirm?: () => void
  onClose?: () => void
}

const variantColors = new Map<string, string>([
  [DialogVariant.PRIMARY, "disabled:cursor-not-allowed disabled:bg-gray-500 bg-simple-primary hover:bg-simple-primary-hover text-white"],
  [DialogVariant.SECONDARY, "disabled:cursor-not-allowed disabled:bg-gray-500 bg-simple-secondary hover:bg-simple-secondary-hover text-white"],
  [DialogVariant.INFO, "disabled:cursor-not-allowed disabled:bg-gray-500 bg-blue-500 hover:bg-blue-400 text-white"],
  [DialogVariant.SUCCESS, "disabled:cursor-not-allowed disabled:bg-gray-500 bg-green-600 hover:bg-green-500 text-white"],
  [DialogVariant.DANGER, "disabled:cursor-not-allowed disabled:bg-gray-500 bg-red-600 hover:bg-red-400 text-white"],
  [DialogVariant.WARNING, "disabled:cursor-not-allowed disabled:bg-gray-500 bg-amber-600 hover:bg-amber-700 text-white"],
])

const iconContainerColors = new Map<string, string>([
  [DialogVariant.PRIMARY, "bg-simple-primary-hover"],
  [DialogVariant.SECONDARY, "bg-simple-secondary-hover"],
  [DialogVariant.INFO, "bg-blue-500/10"],
  [DialogVariant.SUCCESS, "bg-green-500/10"],
  [DialogVariant.DANGER, "bg-red-500/10"],
  [DialogVariant.WARNING, "bg-amber-500/10"],
])

const iconColors = new Map<string, string>([
  [DialogVariant.PRIMARY, "text-simple-primary"],
  [DialogVariant.SECONDARY, "text-simple-secondary"],
  [DialogVariant.INFO, "text-blue-500"],
  [DialogVariant.SUCCESS, "text-green-600"],
  [DialogVariant.DANGER, "text-red-600"],
  [DialogVariant.WARNING, "text-amber-600"],
])

export function ActionDialog(props: Readonly<ActionDialogProps>): React.JSX.Element {
  const {
    variant = DialogVariant.PRIMARY,
    title,
    content,
    confirmLabel = "Continue",
    cancelLabel = "Cancel",
    opened = false,
    loading = false,
    onConfirm = () => { },
    onClose = () => { },
  } = props

  const variantColor = variantColors.get(variant)
  const iconContainerColor = iconContainerColors.get(variant)
  const iconColor = iconColors.get(variant)

  const canClose = !loading

  return (
    <Overlay
      opened={opened}
      onClose={canClose ? undefined : onClose}>
      <div className="flex min-h-full justify-center items-end sm:items-center p-4 sm:p-0">
        <div className="relative w-full transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg">
          <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={
                "mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 " +
                iconContainerColor
              }>
                <FaExclamationTriangle className={"h-6 w-6 " + iconColor} />
              </div>

              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex flex-col gap-2">
                {
                  title &&
                  <Dialog.Title as="h3" className="text-base font-semibold text-white">
                    {title}
                  </Dialog.Title>
                }

                {
                  content &&
                  <div className="text-sm text-gray-200">
                    {content}
                  </div>
                }
              </div>
            </div>
          </div>

          <div className="bg-gray-700/25 px-4 py-3 flex flex-col sm:flex-row-reverse gap-3 sm:px-6">
            <button type="button" onClick={onConfirm}
              className={
                "inline-flex gap-1 w-full justify-center rounded-md px-3 py-2 text-sm font-semibold sm:w-auto " +
                variantColor
              }
              disabled={loading}>
              {confirmLabel}

              {loading && <Spinner size="xs" />}
            </button>

            <button type="button" autoFocus onClick={onClose}
              className={
                `inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold sm:w-auto sm:mt-0 ` +
                `disabled:cursor-not-allowed disabled:bg-gray-500 bg-white/10 hover:bg-white/20 text-white`
              }
              disabled={loading}>
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}