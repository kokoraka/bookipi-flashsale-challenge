import React from "react"
import { createPortal } from "react-dom"
import { Dialog, Transition } from "@headlessui/react"

type OverlayProps = {
  children?: React.ReactNode
  overlayElementId?: string
  opened?: boolean
  autoCloseAble?: boolean
  onClose?: () => void
}

export function Overlay(props: Readonly<OverlayProps>): React.JSX.Element {
  const {
    overlayElementId = "overlay-root",
  } = props

  if (globalThis.window === undefined) {
    return <></>
  }

  const overlayRoot = document.getElementById(overlayElementId)
  if (!overlayRoot) {
    return <></>
  }

  return createPortal(
    <Component {...props} />,
    overlayRoot
  )
}

const Component = (props: OverlayProps): React.JSX.Element => {
  const {
    children,
    opened = false,
    autoCloseAble = false,
    onClose = () => { },
  } = props

  return (
    <Transition appear show={opened} as={React.Fragment}>
      <Dialog as="div" className="relative z-30" onClose={() => {
        if (autoCloseAble) {
          onClose?.()
        }
      }}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <Dialog.Panel className="relative w-full h-full">
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}