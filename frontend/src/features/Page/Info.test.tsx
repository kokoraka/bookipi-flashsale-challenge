
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Info } from './Info'

describe('Info', () => {
  describe('rendering', () => {
    it('should render default title and subtitle', () => {
      render(React.createElement(Info, {}))

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Unexpected error happened',
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Please try again later',
        }),
      ).toBeInTheDocument()
    })

    it('should render custom title and subtitle', () => {
      render(
        React.createElement(Info, {
          title: '500',
          subtitle: 'Internal server error',
        }),
      )

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: '500',
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Internal server error',
        }),
      ).toBeInTheDocument()
    })

    it('should render custom title with default subtitle', () => {
      render(
        React.createElement(Info, {
          title: 'Something went wrong',
        }),
      )

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Something went wrong',
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Please try again later',
        }),
      ).toBeInTheDocument()
    })

    it('should render custom subtitle with default title', () => {
      render(
        React.createElement(Info, {
          subtitle: 'Contact support if the problem persists',
        }),
      )

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Unexpected error happened',
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Contact support if the problem persists',
        }),
      ).toBeInTheDocument()
    })

    it('should not render subtitle when subtitle is empty', () => {
      render(
        React.createElement(Info, {
          subtitle: '',
        }),
      )

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Unexpected error happened',
        }),
      ).toBeInTheDocument()

      expect(
        screen.queryByRole('heading', {
          level: 2,
        }),
      ).not.toBeInTheDocument()
    })
  })
})
