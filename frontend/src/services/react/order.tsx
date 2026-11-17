import { useRequestExecutor } from "./tanstack"
import {
  placeOrder,
  getOrderById,
} from "../orvalapi/orval"
import { PlaceOrderRequest } from "../orvalapi/placeOrderRequest"
import { PlaceOrderResponse } from "../orvalapi/placeOrderResponse"
import { Status } from "../../status"
import * as Axios from "axios"
import { ResponseInfo } from "../orvalapi"

export function usePlaceOrder() {
  const execute = async (data: PlaceOrderRequest, opts?: Axios.AxiosRequestConfig<unknown>): Promise<PlaceOrderResponse> => {
    try {
      const placeRes = await placeOrder(data, opts)
      const status = Status.fromObjectAlways(placeRes)

      return {
        status,
        data: placeRes.data,
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
  }

  return {
    execute
  }
}

export function useGetOrderById() {
  return useRequestExecutor(getOrderById)
}
