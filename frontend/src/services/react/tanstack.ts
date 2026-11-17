import React from "react"
import { useMutation } from "@tanstack/react-query"
import * as Axios from "axios"
import { Status } from "./../../status"
import { ResponseInfo, ResponseStatus } from "../orvalapi"

type ResponseObject<T> = {
  status: ResponseStatus;
  data?: T
}

export function useRequestExecutor<TArgs extends unknown[], TResponse>(
  request: (...args: TArgs) => Promise<ResponseObject<TResponse>>,
) {
  const requestor = useMutation({
    mutationFn: async (args: TArgs) => {
      try {
        const response = await request(...args)

        return {
          status: Status.fromObjectAlways(response),
          data: response.data,
        }
      } catch (e: unknown) {
        if (Axios.isAxiosError<ResponseInfo>(e)) {
          return {
            status: Status.fromObjectAlways(e.response?.data),
          }
        }

        return {
          status: Status.fromError(e),
        }
      }
    },
  })

  const error = React.useMemo(() => {
    if (!requestor.error) {
      return undefined
    }

    if (Axios.isAxiosError<ResponseInfo>(requestor.error)) {
      return Status.fromObjectAlways(requestor.error.response?.data)
    }

    return Status.fromError(requestor.error)
  }, [requestor.error])

  return {
    isPending: requestor.isPending,
    isError: requestor.isError,
    isSuccess: requestor.isSuccess,
    error,
    data: requestor.data?.data,
    reset: requestor.reset,
    execute: requestor.mutateAsync,
  }
}