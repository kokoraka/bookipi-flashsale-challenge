import React from "react"
import { UseMutationResult, useMutation } from "@tanstack/react-query"
import * as Axios from "axios"
import { Status } from "./../../status"
import { ResponseInfo, ResponseStatus } from "../orvalapi"

type ResponseObject<T> = {
  status: ResponseStatus;
  data?: T
}

type ResponseData<T extends ResponseObject<unknown>> = T["data"]

export function useMutationExecutor<
  TData extends ResponseObject<unknown>,
  TVariables,
  TError = unknown,
  TContext = unknown,
>(
  mutation: UseMutationResult<
    TData,
    TError,
    TVariables,
    TContext
  >,
) {

  const mutateAsync = mutation.mutateAsync

  const execute = React.useCallback(
    async (request: TVariables): Promise<{
      status: Status
      data?: ResponseData<TData>
    }> => {
      try {
        const response = await mutateAsync(request)

        return {
          status: Status.fromObjectAlways(response),
          data: response.data as ResponseData<TData> | undefined,
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
    [mutateAsync],
  )

  const error = React.useMemo(() => {
    if (!mutation.error) {
      return undefined
    }

    if (Axios.isAxiosError<ResponseInfo>(mutation.error)) {
      return Status.fromObjectAlways(mutation.error.response?.data)
    }

    return Status.fromError(mutation.error)
  }, [mutation.error])

  return {
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error,
    data: mutation.data?.data as ResponseData<TData> | undefined,
    reset: mutation.reset,
    execute,
  }
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