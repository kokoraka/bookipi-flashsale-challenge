import { Status } from "./../entities/status/Status.js"

export const REPOSITORY_PRODUCT_TOKEN = Symbol('REPOSITORY_PRODUCT_TOKEN');

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
