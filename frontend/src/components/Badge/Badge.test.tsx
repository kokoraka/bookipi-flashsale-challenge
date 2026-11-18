
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  describe('when rendering', () => {
    it('should render children', () => {
      render(
        <Badge variant="info">
          Information
        </Badge>
      )

      expect(screen.getByText('Information')).toBeInTheDocument()
    })

    it('should render as a span element', () => {
      render(
        <Badge variant="info">
          Information
        </Badge>
      )

      expect(screen.getByText('Information').tagName).toBe('SPAN')
    })
  })

  describe('when variant is info', () => {
    it('should apply info variant classes', () => {
      render(<Badge variant="info">Info</Badge>)

      const badge = screen.getByText('Info')

      expect(badge).toHaveClass(
        'w-fit',
        'p-1',
        'text-sm',
        'rounded-md',
        'outline',
        'outline-none',
        'bg-blue-200',
        'border-blue-300',
      )
    })
  })

  describe('when variant is success', () => {
    it('should apply success variant classes', () => {
      render(<Badge variant="success">Success</Badge>)

      expect(screen.getByText('Success')).toHaveClass(
        'bg-green-200',
        'border-green-300',
      )
    })
  })

  describe('when variant is warning', () => {
    it('should apply warning variant classes', () => {
      render(<Badge variant="warning">Warning</Badge>)

      expect(screen.getByText('Warning')).toHaveClass(
        'bg-orange-200',
        'border-orange-300',
      )
    })
  })

  describe('when variant is danger', () => {
    it('should apply danger variant classes', () => {
      render(<Badge variant="danger">Danger</Badge>)

      expect(screen.getByText('Danger')).toHaveClass(
        'bg-red-200',
        'border-red-300',
      )
    })
  })

  describe('when variant is disabled', () => {
    it('should apply disabled variant classes', () => {
      render(<Badge variant="disabled">Disabled</Badge>)

      expect(screen.getByText('Disabled')).toHaveClass(
        'bg-gray-200',
        'border-gray-300',
      )
    })
  })

  describe('when children are not provided', () => {
    it('should render an empty badge', () => {
      const { container } = render(<Badge variant="info" />)

      expect(container.querySelector('span')).toBeInTheDocument()
      expect(container.querySelector('span')).toBeEmptyDOMElement()
    })
  })
})
