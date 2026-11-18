
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dateFormat, isSameDay } from '../../services/date/date'
import {
  PROMOTION_LABEL,
  PromotionState,
  PromotionView,
} from './Promotion'

vi.mock('../../services/date/date', () => ({
  dateFormat: vi.fn(),
  isSameDay: vi.fn(),
}))

describe('PromotionView', () => {
  const startAt = new Date('2026-11-17T09:00:00')
  const endAt = new Date('2026-11-17T18:00:00')
  const currentDate = new Date('2026-11-17T12:00:00')

  let promotion: PromotionView

  beforeEach(() => {
    vi.clearAllMocks()

    vi.useFakeTimers()
    vi.setSystemTime(currentDate)

    promotion = new PromotionView({
      unique_id: 'promotion-123',
      start_at: startAt,
      end_at: endAt,
      state: PromotionState.ONGOING,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
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

  describe('isUpcoming', () => {
    it.each([
      [PromotionState.UPCOMING, true],
      [PromotionState.ONGOING, false],
      [PromotionState.DISABLED, false],
      [PromotionState.ENDED, false],
      [PromotionState.INVALID, false],
    ])('should return %s result for state %s', (state, expected) => {
      const result = new PromotionView({
        unique_id: 'promotion-123',
        start_at: startAt,
        end_at: endAt,
        state,
      })

      expect(result.isUpcoming()).toBe(expected)
    })
  })

  describe('isDisabled', () => {
    it.each([
      [PromotionState.DISABLED, true],
      [PromotionState.UPCOMING, false],
      [PromotionState.ONGOING, false],
      [PromotionState.ENDED, false],
      [PromotionState.INVALID, false],
    ])('should return %s result for state %s', (state, expected) => {
      const result = new PromotionView({
        unique_id: 'promotion-123',
        start_at: startAt,
        end_at: endAt,
        state,
      })

      expect(result.isDisabled()).toBe(expected)
    })
  })

  describe('isEnded', () => {
    it.each([
      [PromotionState.ENDED, true],
      [PromotionState.UPCOMING, false],
      [PromotionState.ONGOING, false],
      [PromotionState.DISABLED, false],
      [PromotionState.INVALID, false],
    ])('should return %s result for state %s', (state, expected) => {
      const result = new PromotionView({
        unique_id: 'promotion-123',
        start_at: startAt,
        end_at: endAt,
        state,
      })

      expect(result.isEnded()).toBe(expected)
    })
  })

  describe('isOngoing', () => {
    it.each([
      [PromotionState.ONGOING, true],
      [PromotionState.UPCOMING, false],
      [PromotionState.DISABLED, false],
      [PromotionState.ENDED, false],
      [PromotionState.INVALID, false],
    ])('should return %s result for state %s', (state, expected) => {
      const result = new PromotionView({
        unique_id: 'promotion-123',
        start_at: startAt,
        end_at: endAt,
        state,
      })

      expect(result.isOngoing()).toBe(expected)
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
    it('should return disabled message when promotion is disabled', () => {
      const disabledPromotion = new PromotionView({
        unique_id: 'promotion-123',
        start_at: startAt,
        end_at: endAt,
        state: PromotionState.DISABLED,
      })

      expect(disabledPromotion.getStateMessage()).toBe(
        'Promotion disabled',
      )

      expect(isSameDay).not.toHaveBeenCalled()
      expect(dateFormat).not.toHaveBeenCalled()
    })

    it('should return time-only format when promotion starts and ends on the current day', () => {
      vi.mocked(isSameDay)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)

      vi.mocked(dateFormat)
        .mockReturnValueOnce('9:00:00')
        .mockReturnValueOnce('18:00:00')

      const result = promotion.getStateMessage()

      expect(result).toBe('9:00:00 - 18:00:00')

      expect(isSameDay).toHaveBeenNthCalledWith(1, startAt, endAt)
      expect(isSameDay).toHaveBeenNthCalledWith(2, currentDate, startAt)

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

    it('should return full date-time format when promotion spans multiple days', () => {
      vi.mocked(isSameDay)
        .mockReturnValueOnce(false)

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

    it('should return full date-time format when promotion is not on the current day', () => {
      vi.mocked(isSameDay)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)

      vi.mocked(dateFormat)
        .mockReturnValueOnce('2026-11-17 9:00:00')
        .mockReturnValueOnce('2026-11-17 18:00:00')

      const result = promotion.getStateMessage()

      expect(result).toBe(
        '2026-11-17 9:00:00 - 2026-11-17 18:00:00',
      )

      expect(isSameDay).toHaveBeenNthCalledWith(1, startAt, endAt)
      expect(isSameDay).toHaveBeenNthCalledWith(2, currentDate, startAt)

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
  })
})
