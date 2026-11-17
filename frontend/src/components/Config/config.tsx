/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

type ConfigProps = {
  values?: Values
}

interface Values {
  [key: string]: any
}

export function Config(props?: ConfigProps) {
  const {
    values = import.meta.env || {}
  } = props || {
    values: import.meta.env
  }

  const config = new Map()

  const keys = Object.keys(values)
  for (const key of keys) {
    if (values[key]) {
      config.set(key, values[key])
    }
  }

  // @note: the key available
  function has(key: string): boolean {
    return config.has(key)
  }

  // @note: the key available and not empty
  function notEmpty(key: string): boolean {
    return config.has(key) && config.get(key) !== undefined
  }

  // @note: the key available and is a true value
  function isTrue(key: string): boolean {
    return config.has(key) && config.get(key) == "true"
  }

  // @note: the key available and is a false value
  function isFalse(key: string): boolean {
    return config.has(key) && config.get(key) == "false"
  }

  function get(key: string): string | undefined {
    return config.has(key) ? config.get(key) : undefined
  }

  function getString(key: string): string {
    return config.has(key) ? config.get(key) : ""
  }

  function getNumber(key: string): number {
    return config.has(key) ? Number(config.get(key)) : 0
  }

  function items<T>(key: string): Array<T> {
    if (!notEmpty(key)) {
      return []
    }

    return Array.from(JSON.parse(config.get(key)))
  }

  return {
    has,
    notEmpty,
    isTrue,
    isFalse,
    get,
    getString,
    getNumber,
    items
  }
}

export function useConfig(props?: ConfigProps) {
  return Config(props)
}