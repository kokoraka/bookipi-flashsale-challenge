import { useMutationExecutor, useRequestExecutor } from "./tanstack"
import {
  usePlaceOrder as orvalPlaceOrder,
  getOrderById,
} from "../orvalapi/orval"

export function usePlaceOrder() {
  return useMutationExecutor(orvalPlaceOrder())
}

export function useGetOrderById() {
  return useRequestExecutor(getOrderById)
}
