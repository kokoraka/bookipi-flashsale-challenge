import * as Yup from "yup"
// eslint-disable-next-line react-refresh/only-export-components
export * as PhoneValidator from "yup-phone-lite"
import { ValidationError as YupValidationError } from "yup"

type Rule = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
}

type Option = {
  abortEarly?: boolean
}

type ValidatorResult = {
  validate: Validator
}

type Validator = (data: unknown) => ValidationResult

export type ValidationResult = {
  error?: ValidationError
  data?: unknown
}

export class ValidationError {
  private readonly code: string
  private readonly message: string
  private readonly issues: Map<string, ValidationError[]>

  constructor(code: string, message: string, issues: Map<string, ValidationError[]> = new Map()) {
    this.code = code
    this.message = message
    this.issues = issues
  }

  public hasIssues(): boolean {
    return this.issues && this.issues.size > 0
  }

  public getIssues(): Map<string, ValidationError[]> {
    return this.issues
  }

  public getCode(): string {
    return this.code
  }

  public getMessage(): string {
    return this.message
  }

}

// eslint-disable-next-line react-refresh/only-export-components
export function useValidator(rule: Rule, opt?: Option): [ValidatorResult] {
  const {
    abortEarly = false,
  } = opt || {
    abortEarly: false,
  }

  function validate(data: unknown): ValidationResult {
    try {
      const yupValidator = Yup.object(rule)

      const res = yupValidator.validateSync(data, {
        abortEarly,
      })
      return {
        data: res
      }
    } catch (err: unknown) {
      const isYupError = err instanceof YupValidationError
      if (!isYupError) {
        const e = err as Error
        return {
          error: new ValidationError("SYSTEM.UNKNOWN_ERROR", e.message)
        }
      }

      const issues = new Map<string, ValidationError[]>()
      for (const e of err.inner) {
        if (!e.path) {
          continue
        }

        const key = e.path.replace("[", ".").replace("].", ".")

        issues.set(key, [new ValidationError("VALIDATION." + e.type, e.message)])
      }

      return {
        error: new ValidationError("VALIDATION.INVALID_PARAM", err.message, issues)
      }
    }
  }

  const validator = {
    validate
  }
  return [validator]
}

export {
  Yup as Validator
}