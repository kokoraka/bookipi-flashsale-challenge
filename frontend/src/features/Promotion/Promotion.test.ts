
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dateFormat, isSameDay } from '../../typeconv/date'
import {
  PROMOTION_LABEL,
  PromotionState,
  PromotionView,
} from './Promotion'

vi.mock('../../typeconv/date', () => ({
  dateFormat: vi.fn(),
  isSameDay: vi.fn(),
}))

describe('PromotionView', () => {
  const startAt = new Date('2026-11-17T09:00:00')
  const endAt = new Date('2026-11-17T18:00:00')

  let promotion: PromotionView

  beforeEach(() => {
    vi.clearAllMocks()

    promotion = new PromotionView({
      unique_id: 'promotion-123',
      start_at: startAt,
      end_at: endAt,
      state: PromotionState.ONGOING,
    })
  })

  describe('constructor', () => {
    it('should initialize promotion properties', () => {
      expect(promotion.getPromotionId()).toBe('promotion-123')
      expect(promotion.getStateLabel()).toBe('Ongoing')
    })
  })

  describe('getPromotionId', () => {
    it('should return promotion unique ID', () => {
      expect(promotion.getPromotionId()).toBe('promotion-123')
    })
  })

  describe('getStateLabel', () => {
    it.each([
      [PromotionState.INVALID, 'Invalid'],
      [PromotionState.DISABLED, 'Disabled'],
      [PromotionState.UPCOMING, 'Upcoming'],
      [PromotionState.ENDED, 'Ended'],
      [PromotionState.ONGOING, 'Ongoing'],
    ])('should return "%s" label', (state, expected) => {
      const result = new PromotionView({
        unique_id: 'promotion-123',
        start_at: startAt,
        end_at: endAt,
        state,
      })

      expect(result.getStateLabel()).toBe(expected)
    })

    it('should match all promotion labels', () => {
      expect(PROMOTION_LABEL).toEqual({
        [PromotionState.INVALID]: 'Invalid',
        [PromotionState.DISABLED]: 'Disabled',
        [PromotionState.UPCOMING]: 'Upcoming',
        [PromotionState.ENDED]: 'Ended',
        [PromotionState.ONGOING]: 'Ongoing',
      })
    })
  })

  describe('getStateMessage', () => {
    it('should return time-only format when promotion starts and ends on the same day', () => {
      vi.mocked(isSameDay).mockReturnValue(true)

      vi.mocked(dateFormat)
        .mockReturnValueOnce('9:00:00')
        .mockReturnValueOnce('18:00:00')

      const result = promotion.getStateMessage()

      expect(result).toBe('9:00:00 - 18:00:00')

      expect(isSameDay).toHaveBeenCalledWith(startAt, endAt)

      expect(dateFormat).toHaveBeenNthCalledWith(
        1,
        startAt,
        'h:mm:ss',
      )

      expect(dateFormat).toHaveBeenNthCalledWith(
        2,
        endAt,
        'h:mm:ss',
      )
    })

    it('should return date and time format when promotion spans multiple days', () => {
      vi.mocked(isSameDay).mockReturnValue(false)

      vi.mocked(dateFormat)
        .mockReturnValueOnce('2026-11-17 9:00:00')
        .mockReturnValueOnce('2026-11-19 18:00:00')

      const result = promotion.getStateMessage()

      expect(result).toBe(
        '2026-11-17 9:00:00 - 2026-11-19 18:00:00',
      )

      expect(isSameDay).toHaveBeenCalledWith(startAt, endAt)

      expect(dateFormat).toHaveBeenNthCalledWith(
        1,
        startAt,
        'YYYY-MM-DD h:mm:ss',
      )

      expect(dateFormat).toHaveBeenNthCalledWith(
        2,
        endAt,
        'YYYY-MM-DD h:mm:ss',
      )
    })

    it('should format both dates independently for multi-day promotions', () => {
      vi.mocked(isSameDay).mockReturnValue(false)

      vi.mocked(dateFormat)
        .mockReturnValueOnce('start-date')
        .mockReturnValueOnce('end-date')

      expect(promotion.getStateMessage()).toBe(
        'start-date - end-date',
      )

      expect(dateFormat).toHaveBeenCalledTimes(2)
    })
  })
})
