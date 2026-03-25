import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatsCards from './StatsCards'

const baseStats = {
  totalCount: 100,
  onTimeCount: 75,
  delayedCount: 20,
  canceledCount: 5,
  averageDelayMinutes: 7.5,
  maxDelayMinutes: 45,
}

describe('StatsCards', () => {
  it('rendira sva tri grupna naslova', () => {
    render(<StatsCards stats={baseStats} />)
    expect(screen.getByText('Trafik')).toBeInTheDocument()
    expect(screen.getByText('Förseningar')).toBeInTheDocument()
    expect(screen.getByText('Försening')).toBeInTheDocument()
  })

  it('prikazuje točan ukupni broj tågova', () => {
    render(<StatsCards stats={baseStats} />)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('prikazuje točan broj i tid', () => {
    render(<StatsCards stats={baseStats} />)
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('prikazuje točan postotak försening', () => {
    render(<StatsCards stats={baseStats} />)
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('prikazuje snittförsening s jednom decimalom', () => {
    render(<StatsCards stats={baseStats} />)
    expect(screen.getByText('7.5 min')).toBeInTheDocument()
  })

  it('prikazuje max försening', () => {
    render(<StatsCards stats={baseStats} />)
    expect(screen.getByText('45 min')).toBeInTheDocument()
  })

  it('ne renderira ništa ako stats nije proslijeđen', () => {
    const { container } = render(<StatsCards stats={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('prikazuje 0% kad nema kašnjenja', () => {
    render(<StatsCards stats={{ ...baseStats, delayedCount: 0 }} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
