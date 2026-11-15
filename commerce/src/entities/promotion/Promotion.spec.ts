
import { describe, expect, it } from 'vitest'
import { Promotion, PromotionState } from './Promotion.js'

describe('Promotion', () => {
  const startTime = new Date('2026-11-15T10:00:00.000Z')
  const endTime = new Date('2026-11-15T12:00:00.000Z')

  describe('getStateCode', () => {
    describe('when promotion is invalid', () => {
      it('should return INVALID when start time is invalid', () => {
        const promotion = new Promotion(
          true,
          new Date('invalid'),
          endTime,
          new Date('2026-11-15T11:00:00.000Z'),
        )

        expect(promotion.getStateCode()).toBe(PromotionState.INVALID)
      })

      it('should return INVALID when end time is invalid', () => {
        const promotion = new Promotion(
          true,
          startTime,
          new Date('invalid'),
          new Date('2026-11-15T11:00:00.000Z'),
        )

        expect(promotion.getStateCode()).toBe(PromotionState.INVALID)
      })

      it('should return INVALID when start time equals end time', () => {
        const promotion = new Promotion(
          true,
          startTime,
          startTime,
          new Date('2026-11-15T11:00:00.000Z'),
        )

        expect(promotion.getStateCode()).toBe(PromotionState.INVALID)
      })

      it('should return INVALID when start time is after end time', () => {
        const promotion = new Promotion(
          true,
          endTime,
          startTime,
          new Date('2026-11-15T11:00:00.000Z'),
        )

        expect(promotion.getStateCode()).toBe(PromotionState.INVALID)
      })
    })

    describe('when promotion is disabled', () => {
      it('should return DISABLED regardless of current time', () => {
        const promotion = new Promotion(
          false,
          startTime,
          endTime,
          new Date('2026-11-15T11:00:00.000Z'),
        )

        expect(promotion.getStateCode()).toBe(PromotionState.DISABLED)
      })

      it('should return DISABLED even when promotion has ended', () => {
        const promotion = new Promotion(
          false,
          startTime,
          endTime,
          new Date('2026-11-15T13:00:00.000Z'),
        )

        expect(promotion.getStateCode()).toBe(PromotionState.DISABLED)
      })
    })

    describe('when promotion is enabled', () => {
      describe('when current time is before start time', () => {
        it('should return UPCOMING', () => {
          const promotion = new Promotion(
            true,
            startTime,
            endTime,
            new Date('2026-11-15T09:59:59.999Z'),
          )

          expect(promotion.getStateCode()).toBe(PromotionState.UPCOMING)
        })
      })

      describe('when current time equals start time', () => {
        it('should return ONGOING', () => {
          const promotion = new Promotion(
            true,
            startTime,
            endTime,
            startTime,
          )

          expect(promotion.getStateCode()).toBe(PromotionState.ONGOING)
        })
      })

      describe('when current time is between start and end time', () => {
        it('should return ONGOING', () => {
          const promotion = new Promotion(
            true,
            startTime,
            endTime,
            new Date('2026-11-15T11:00:00.000Z'),
          )

          expect(promotion.getStateCode()).toBe(PromotionState.ONGOING)
        })
      })

      describe('when current time equals end time', () => {
        it('should return ENDED', () => {
          const promotion = new Promotion(
            true,
            startTime,
            endTime,
            endTime,
          )

          expect(promotion.getStateCode()).toBe(PromotionState.ENDED)
        })
      })

      describe('when current time is after end time', () => {
        it('should return ENDED', () => {
          const promotion = new Promotion(
            true,
            startTime,
            endTime,
            new Date('2026-11-15T12:00:00.001Z'),
          )

          expect(promotion.getStateCode()).toBe(PromotionState.ENDED)
        })
      })
    })
  })

  describe('getStateMessage', () => {
    it.each([
      {
        enabled: true,
        currentTime: new Date('invalid'),
        expectedState: PromotionState.INVALID,
        expectedMessage: 'promotion is invalid',
      },
      {
        enabled: false,
        currentTime: new Date('2026-11-15T11:00:00.000Z'),
        expectedState: PromotionState.DISABLED,
        expectedMessage: 'promotion is disabled',
      },
      {
        enabled: true,
        currentTime: new Date('2026-11-15T09:00:00.000Z'),
        expectedState: PromotionState.UPCOMING,
        expectedMessage: 'promotion is not started yet',
      },
      {
        enabled: true,
        currentTime: new Date('2026-11-15T13:00:00.000Z'),
        expectedState: PromotionState.ENDED,
        expectedMessage: 'promotion has ended',
      },
      {
        enabled: true,
        currentTime: new Date(startTime.getTime() + 1_000),
        expectedState: PromotionState.ONGOING,
        expectedMessage: 'promotion is ongoing',
      },
    ])(
      'should return "$expectedMessage" when state is $expectedState',
      ({ enabled, currentTime, expectedMessage }) => {
        const promotion = new Promotion(
          enabled,
          startTime,
          endTime,
          currentTime,
        )

        expect(promotion.getStateMessage()).toBe(expectedMessage)
      },
    )
  })

  describe('isState', () => {
    it.each([
      {
        currentTime: new Date('2026-11-15T09:00:00.000Z'),
        state: PromotionState.UPCOMING,
        expected: true,
      },
      {
        currentTime: new Date('2026-11-15T09:00:00.000Z'),
        state: PromotionState.ONGOING,
        expected: false,
      },
      {
        currentTime: new Date('2026-11-15T11:00:00.000Z'),
        state: PromotionState.ONGOING,
        expected: true,
      },
      {
        currentTime: new Date('2026-11-15T13:00:00.000Z'),
        state: PromotionState.ENDED,
        expected: true,
      },
      {
        currentTime: new Date('2026-11-15T11:00:00.000Z'),
        state: PromotionState.DISABLED,
        expected: false,
      },
      {
        currentTime: new Date('2026-11-15T11:00:00.000Z'),
        state: PromotionState.INVALID,
        expected: false,
      },
    ])(
      'should return $expected when checking $state',
      ({ currentTime, state, expected }) => {
        const promotion = new Promotion(
          true,
          startTime,
          endTime,
          currentTime,
        )

        expect(promotion.isState(state)).toBe(expected)
      },
    )
  })
})
