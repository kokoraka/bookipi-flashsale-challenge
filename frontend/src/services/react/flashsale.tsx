import { useRequestExecutor } from "./tanstack"
import {
  getFlashsalePromotionById,
  getFlashsaleProductById,
} from "../orvalapi/orval"

export function useGetFlashsalePromotionById() {
  return useRequestExecutor(getFlashsalePromotionById)
}

export function useGetFlashsaleProductById() {
  return useRequestExecutor(getFlashsaleProductById)
}
