
import { describe, it, expect } from 'vitest'
import { ProductView } from './ProductView'

describe('ProductView', () => {
  const defaultParams = {
    unique_id: 'product-123',
    name: 'Test Product',
    description: 'Product description',
    unit_price: 100,
    thumbnail_url: 'https://example.com/product.png',
    available_quantity: 20,
  }

  describe('constructor', () => {
    it('should initialize product properties', () => {
      const product = new ProductView(defaultParams)

      expect(product.getProductId()).toBe(defaultParams.unique_id)
      expect(product.getProductName()).toBe(defaultParams.name)
      expect(product.getProductDescription()).toBe(defaultParams.description)
      expect(product.getFormatedPrice()).toBe('AU$100')
      expect(product.getThumbnailUrl()).toBe(defaultParams.thumbnail_url)
      expect(product.hasStock()).toBe(true)
    })
  })

  describe('getProductId', () => {
    it('should return product unique id', () => {
      const product = new ProductView(defaultParams)

      expect(product.getProductId()).toBe('product-123')
    })
  })

  describe('getProductName', () => {
    it('should return product name', () => {
      const product = new ProductView(defaultParams)

      expect(product.getProductName()).toBe('Test Product')
    })
  })

  describe('hasProductDescription', () => {
    it('should return true when description exists', () => {
      const product = new ProductView(defaultParams)

      expect(product.hasProductDescription()).toBe(true)
    })

    it('should return false when description is undefined', () => {
      const product = new ProductView({
        ...defaultParams,
        description: undefined,
      })

      expect(product.hasProductDescription()).toBe(false)
    })

    it('should return false when description is empty', () => {
      const product = new ProductView({
        ...defaultParams,
        description: '',
      })

      expect(product.hasProductDescription()).toBe(false)
    })
  })

  describe('getProductDescription', () => {
    it('should return product description', () => {
      const product = new ProductView(defaultParams)

      expect(product.getProductDescription()).toBe('Product description')
    })

    it('should return undefined when description is not provided', () => {
      const product = new ProductView({
        ...defaultParams,
        description: undefined,
      })

      expect(product.getProductDescription()).toBeUndefined()
    })
  })

  describe('getFormatedPrice', () => {
    it('should return formatted price', () => {
      const product = new ProductView(defaultParams)

      expect(product.getFormatedPrice()).toBe('AU$100')
    })

    it('should return formatted price when unit price is zero', () => {
      const product = new ProductView({
        ...defaultParams,
        unit_price: 0,
      })

      expect(product.getFormatedPrice()).toBe('AU$0')
    })

    it('should return formatted price when unit price contains decimals', () => {
      const product = new ProductView({
        ...defaultParams,
        unit_price: 99.99,
      })

      expect(product.getFormatedPrice()).toBe('AU$99.99')
    })
  })

  describe('hasStock', () => {
    it('should return true when available quantity is greater than zero', () => {
      const product = new ProductView({
        ...defaultParams,
        available_quantity: 1,
      })

      expect(product.hasStock()).toBe(true)
    })

    it('should return false when available quantity is zero', () => {
      const product = new ProductView({
        ...defaultParams,
        available_quantity: 0,
      })

      expect(product.hasStock()).toBe(false)
    })
  })

  describe('getFormatedStock', () => {
    it('should return Out of Stock when available quantity is zero', () => {
      const product = new ProductView({
        ...defaultParams,
        available_quantity: 0,
      })

      expect(product.getFormatedStock()).toBe('Out of Stock')
    })

    it('should return Running out when available quantity is less than 10', () => {
      const product = new ProductView({
        ...defaultParams,
        available_quantity: 5,
      })

      expect(product.getFormatedStock()).toBe('Running out')
    })

    it('should return Running out when available quantity is 9', () => {
      const product = new ProductView({
        ...defaultParams,
        available_quantity: 9,
      })

      expect(product.getFormatedStock()).toBe('Running out')
    })

    it('should return In Stock when available quantity is 10', () => {
      const product = new ProductView({
        ...defaultParams,
        available_quantity: 10,
      })

      expect(product.getFormatedStock()).toBe('In Stock')
    })

    it('should return In Stock when available quantity is greater than 10', () => {
      const product = new ProductView({
        ...defaultParams,
        available_quantity: 20,
      })

      expect(product.getFormatedStock()).toBe('In Stock')
    })
  })

  describe('getThumbnailUrl', () => {
    it('should return thumbnail URL when provided', () => {
      const product = new ProductView(defaultParams)

      expect(product.getThumbnailUrl()).toBe(
        'https://example.com/product.png',
      )
    })

    it('should return placeholder URL when thumbnail URL is undefined', () => {
      const product = new ProductView({
        ...defaultParams,
        thumbnail_url: undefined,
      })

      expect(product.getThumbnailUrl()).toBe(
        'https://placehold.co/200x150',
      )
    })

    it('should return empty string when thumbnail URL is empty', () => {
      const product = new ProductView({
        ...defaultParams,
        thumbnail_url: '',
      })

      expect(product.getThumbnailUrl()).toBe('')
    })
  })
})
