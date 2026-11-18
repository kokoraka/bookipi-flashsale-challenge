
type ProductViewParam = {
  unique_id: string
  name: string
  description?: string
  unit_price: number
  thumbnail_url?: string
  available_quantity: number
}

export class ProductView {
  private unique_id: string
  private name: string
  private description?: string
  private unit_price: number
  private thumbnail_url?: string
  private available_quantity: number

  constructor(p: ProductViewParam
  ) {
    this.unique_id = p.unique_id
    this.name = p.name
    this.description = p.description
    this.unit_price = p.unit_price
    this.thumbnail_url = p.thumbnail_url
    this.available_quantity = p.available_quantity
  }

  getProductId(): string {
    return this.unique_id
  }

  getProductName(): string {
    return this.name
  }

  hasProductDescription(): boolean {
    return this.description !== undefined && this.description !== ''
  }

  getProductDescription(): string | undefined {
    return this.description
  }

  getFormatedPrice(): string {
    return `AU$${this.unit_price}`
  }

  hasStock(): boolean {
    return this.available_quantity > 0
  }

  isRunningOut(): boolean {
    return this.available_quantity > 0 && this.available_quantity < 10
  }

  getFormatedStock(): string {
    if (!this.hasStock()) {
      return 'Out of Stock'
    } else if (this.isRunningOut()) {
      return 'Running out'
    }
    return 'In Stock'
  }

  getThumbnailUrl(): string {
    return this.thumbnail_url ?? 'https://placehold.co/200x150'
  }
}