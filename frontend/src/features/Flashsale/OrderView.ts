import { dateFormat } from "../../services/date"

type OrderViewParam = {
  unique_id: string
  grand_total: number
  placed_at: Date
}

export class OrderView {
  private unique_id: string
  private grand_total: number
  private placed_at: Date

  constructor(p: OrderViewParam
  ) {
    this.unique_id = p.unique_id
    this.grand_total = p.grand_total
    this.placed_at = p.placed_at
  }

  getOrderId(): string {
    return this.unique_id
  }

  getFormatedGrandTotal(): string {
    return `AU$${this.grand_total}`
  }

  getFormatedPlacedAt(): string {
    return dateFormat(this.placed_at, "DD/MM/YYYY HH:mm")
  }
}