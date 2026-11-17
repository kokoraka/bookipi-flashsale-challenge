/* eslint-disable @typescript-eslint/ban-ts-comment */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { parse, v7 } from 'uuid'
import { Status } from '../../status'
import { StatusCode } from '../../status'
import { generateIds } from './idgen'

vi.mock('uuid', () => ({
  parse: vi.fn(),
  v7: vi.fn(),
}))

describe('generateIds', () => {
  const mockUuid = '018f0f7e-7b3c-7abc-8def-123456789abc'
  const mockBinary = new Uint8Array(16).fill(1)

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('when generating IDs successfully', () => {
    it('should generate one UUID', () => {
      // @ts-ignore
      vi.mocked(v7).mockReturnValue(mockUuid)
      vi.mocked(parse).mockReturnValue(mockBinary)

      const result = generateIds(1)

      expect(result.status).toBeInstanceOf(Status)
      expect(result.status.code).toBe(StatusCode.SUCCESS)
      expect(result.status.message).toBe('success generate id')

      expect(result.ids).toHaveLength(1)
      expect(result.ids?.[0]).toEqual({
        text: mockUuid,
        binary: Buffer.from(mockBinary),
      })

      expect(v7).toHaveBeenCalledTimes(1)
      expect(parse).toHaveBeenCalledWith(mockUuid)
    })

    it('should generate multiple UUIDs', () => {
      const uuids = [
        '018f0f7e-7b3c-7abc-8def-123456789abc',
        '018f0f7e-7b3c-7abc-8def-123456789abd',
        '018f0f7e-7b3c-7abc-8def-123456789abe',
      ]

      vi.mocked(v7)
        // @ts-ignore
        .mockReturnValueOnce(uuids[0])
        // @ts-ignore
        .mockReturnValueOnce(uuids[1])
        // @ts-ignore
        .mockReturnValueOnce(uuids[2])

      vi.mocked(parse).mockReturnValue(mockBinary)

      const result = generateIds(3)

      expect(result.status.code).toBe(StatusCode.SUCCESS)
      expect(result.ids).toHaveLength(3)
      expect(result.ids?.map(id => id.text)).toEqual(uuids)

      expect(result.ids?.map(id => id.binary)).toEqual(
        uuids.map(() => Buffer.from(mockBinary)),
      )

      expect(v7).toHaveBeenCalledTimes(3)
      expect(parse).toHaveBeenCalledTimes(3)
    })

    it('should return an empty array when quantity is zero', () => {
      const result = generateIds(0)

      expect(result.status.code).toBe(StatusCode.SUCCESS)
      expect(result.status.message).toBe('success generate id')
      expect(result.ids).toEqual([])

      expect(v7).not.toHaveBeenCalled()
      expect(parse).not.toHaveBeenCalled()
    })

    it('should return an empty array when quantity is negative', () => {
      const result = generateIds(-1)

      expect(result.status.code).toBe(StatusCode.SUCCESS)
      expect(result.ids).toEqual([])

      expect(v7).not.toHaveBeenCalled()
      expect(parse).not.toHaveBeenCalled()
    })
  })

  describe('when UUID generation fails', () => {
    it('should return error status when v7 throws an error', () => {
      const error = new Error('UUID generation failed')

      vi.mocked(v7).mockImplementation(() => {
        throw error
      })

      const result = generateIds(1)

      expect(result.status).toBeInstanceOf(Status)
      expect(result.status.code).toBe(StatusCode.SYSTEM_UNKNOWN_ERROR)
      expect(result.status.message).toBe('UUID generation failed')
      expect(result.ids).toBeUndefined()
    })

    it('should return error status when parse throws an error', () => {
      const error = new Error('UUID parsing failed')

      // @ts-ignore
      vi.mocked(v7).mockReturnValue(mockUuid)
      vi.mocked(parse).mockImplementation(() => {
        throw error
      })

      const result = generateIds(1)

      expect(result.status).toBeInstanceOf(Status)
      expect(result.status.code).toBe(StatusCode.SYSTEM_UNKNOWN_ERROR)
      expect(result.status.message).toBe('UUID parsing failed')
      expect(result.ids).toBeUndefined()
    })

    it('should preserve the original Status when v7 throws a Status error', () => {
      const error = new Status(
        StatusCode.SYSTEM_INTERNAL_ERROR,
        'Internal error',
      )

      vi.mocked(v7).mockImplementation(() => {
        throw error
      })

      const result = generateIds(1)

      expect(result.status).toBe(error)
      expect(result.status.code).toBe(StatusCode.SYSTEM_INTERNAL_ERROR)
      expect(result.status.message).toBe('Internal error')
      expect(result.ids).toBeUndefined()
    })
  })
})
