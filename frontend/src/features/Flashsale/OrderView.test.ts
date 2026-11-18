
import { describe, it, expect, vi, afterEach } from 'vitest'
import { OrderView } from './OrderView'
import { dateFormat } from '../../services/date'

vi.mock('../../services/date', () => ({
  dateFormat: vi.fn(),
}))

describe('OrderView', () => {
  const placedAt = new Date('2026-11-18T10:30:00.000Z')

  const params = {
    unique_id: 'order-123',
    grand_total: 150.50,
    placed_at: placedAt,
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrderId', () => {
    describe('When called', () => {
      it('should return the order unique ID', () => {
        const order = new OrderView(params)

        expect(order.getOrderId()).toBe('order-123')
      })
    })
  })

  describe('getFormatedGrandTotal', () => {
    describe('When called', () => {
      it('should return the formatted grand total with AU$ prefix', () => {
        const order = new OrderView(params)

        expect(order.getFormatedGrandTotal()).toBe('AU$150.5')
      })

      it('should return AU$0 when grand total is zero', () => {
        const order = new OrderView({
          ...params,
          grand_total: 0,
        })

        expect(order.getFormatedGrandTotal()).toBe('AU$0')
      })

      it('should preserve decimal precision', () => {
        const order = new OrderView({
          ...params,
          grand_total: 150.75,
        })

        expect(order.getFormatedGrandTotal()).toBe('AU$150.75')
      })
    })
  })

  describe('getFormatedPlacedAt', () => {
    describe('When called', () => {
      it('should return the formatted placed date', () => {
        vi.mocked(dateFormat).mockReturnValue('18/11/2026 17:30')

        const order = new OrderView(params)

        expect(order.getFormatedPlacedAt()).toBe('18/11/2026 17:30')
      })

      it('should call dateFormat with the correct date and format', () => {
        vi.mocked(dateFormat).mockReturnValue('18/11/2026 17:30')

        const order = new OrderView(params)
        order.getFormatedPlacedAt()

        expect(dateFormat).toHaveBeenCalledTimes(1)
        expect(dateFormat).toHaveBeenCalledWith(
          placedAt,
          'DD/MM/YYYY HH:mm',
        )
      })
    })
  })
})
