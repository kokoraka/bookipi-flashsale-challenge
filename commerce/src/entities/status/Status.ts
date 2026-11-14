import { StatusCode } from "./StatusCode.js"

type ResponseObject = {
  status: StatusObject
  validation_errors?: Record<string, ValidationError[]>
}

type StatusObject = {
  code: string
  message: string
}

export type ValidationError = {
  code: string
  message: string
  params?: { [key: string]: string[] }
}

export class Status {

  constructor(
    public code: string,
    public message: string,
    public validationErrors: Map<string, ValidationError[]> = new Map()
  ) { }

  public any(codes: string[]): boolean {
    return Status.any(this.code, codes.map((code) => code.toString()))
  }

  public is(code: string): boolean {
    return Status.any(this.code, [code])
  }

  public valid(): boolean {
    return this.code !== "" && this.message !== ""
  }

  public clear(): void {
    this.code = ""
    this.message = ""
    this.validationErrors = new Map()
  }

  public static any(code: string, codes: string[]): boolean {
    let valid = false
    for (const c of codes) {
      if (code === c) {
        valid = true
        break
      }
    }
    return valid
  }

  public static fromObjectAlways(obj?: ResponseObject): Status {
    if (!obj) {
      return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, "object undefined")
    }

    return Status.fromObject(obj)!
  }

  public static fromObject(obj?: ResponseObject): Status | undefined {
    if (!obj) {
      return undefined
    }

    return new Status(
      obj.status.code,
      obj.status.message,
      new Map(Object.entries(obj.validation_errors ?? {})),
    );
  }

  public static fromError(e: unknown): Status {
    let message = "unknown error"
    if (e instanceof Error) {
      message = e.message
    }

    return new Status(
      StatusCode.SYSTEM_UNKNOWN_ERROR,
      message,
    );
  }

  public static async fromBlobAlways(blob?: Blob): Promise<Status> {
    if (!blob) {
      return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, "object undefined")
    }

    const status = await Status.fromBlob(blob)!
    if (!status) {
      return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, "object undefined")
    }

    return status
  }

  public static async fromBlob(blob?: Blob): Promise<Status | undefined> {
    try {
      if (!blob) {
        return undefined
      }

      const isParseable = typeof blob?.text === "function" && blob.type.includes("application/json")
      if (!isParseable) {
        return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, "data not supported")
      }

      const data = JSON.parse(await blob.text())
      return Status.fromObject(data)
    } catch (e: unknown) {
      const err = e as Error
      return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, err.message)
    }
  }

  public static async fromResponse(response: Response): Promise<Status> {
    try {
      const data = await response.json()

      const status = data.status || {}
      const code = status.code || StatusCode.SYSTEM_INTERNAL_ERROR
      const message = status.message || "error occured"

      const validationErrors = new Map<string, ValidationError[]>([])

      const isBadRequest = response.status == 400 || code == StatusCode.VALIDATION_INVALID_PARAM
      if (isBadRequest) {
        const errors = data.validation_errors || {} as Record<string, ValidationError[]>
        for (const key in errors) {
          validationErrors.set(key, errors[key])
        }
      }

      return new Status(code, message, validationErrors)
    } catch (e: unknown) {
      const err = e as Error
      return new Status(StatusCode.SYSTEM_UNKNOWN_ERROR, err.message)
    }
  }

}
