import { Status } from "./../entities/status/Status.js"

export const REPOSITORY_PRODUCT_TOKEN = Symbol('REPOSITORY_PRODUCT_TOKEN');
export const REPOSITORY_ORDER_TOKEN = Symbol('REPOSITORY_ORDER_TOKEN');

export interface ProductRepositoryInterface {
  getProduct(p: GetProductParam): Promise<GetProductResult>
}

export type GetProductParam = {
  unique_id: string
}

export type GetProductResult = {
  status: Status
  product?: GetProductItem
}

export type GetProductItem = {
  unique_id: string
  name: string
  description?: string
  thumbnail?: FileObject
  selling_price: number
  created_at: Date
  updated_at?: Date
}

type ProvidedObject = {
  provider: string
}

type FileObject = ProvidedObject & {
  file: File
}

type File = {
  id?: string
  public_url?: string
}

export interface OrderRepositoryInterface {
  createOrder(p: CreateOrderParam): Promise<CreateOrderResult>
}

export type CreateOrderParam = {
  idempotency_key: string
  unique_id: string
  buyer_name: string
  buyer_email: string
  buyer_snapshot?: Record<string, unknown>
  status: string
  grand_total: number
  item: CreateOrderParamItem
  placed_at: Date
  created_at: Date
}

type CreateOrderParamItem = {
  unique_id: string
  name: string
  description?: string
  quantity: number
  unit_price: number
  product_id: string
  product_snapshot?: Record<string, unknown>
}

export type CreateOrderResult = {
  status: Status
  order?: CreateOrderItem
}

export type CreateOrderItem = {
  exists: boolean
  unique_id: string
}
