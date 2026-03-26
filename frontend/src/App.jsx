import { useEffect, useState, useMemo } from 'react'
import StatsCards from './components/StatsCards'
import DelayChart from './components/DelayChart'
import DelayByHourChart from './components/DelayByHourChart'
import DelayByTrainChart from './components/DelayByTrainChart'
import DelayByWeekdayChart from './components/DelayByWeekdayChart'
import DeviationChart from './components/DeviationChart'
import DelayTrendChart from './components/DelayTrendChart'
import TrainTable from './components/TrainTable'
import StationSelector from './components/StationSelector'
import { TrendLegend, BarLegend } from './components/Legend'
import HeroSection from './components/HeroSection'
import { getStationName, populateStationMap } from './utils/stationNames'

const REFRESH_INTERVAL = 60_000

export default function App() {
  const [stations, setStations] = useState([])
  const [selectedStation, setSelectedStation] = useState(null)
  const [activityType, setActivityType] = useState('avgang')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [trains, setTrains] = useState([])
  const [historicalTrains, setHistoricalTrains] = useState([])
  const [historicalStats, setHistoricalStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activeTab, setActiveTab] = useState('aktuellt')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [statsFromDate, setStatsFromDate] = useState('')

  async function fetchStations() {
    try {
      const res = await fetch('/train_announcements/stations')
      const data = await res.json()
      populateStationMap(data)
      const selectable = data.filter((s) => s.selectable)
      setStations(selectable)
      setSelectedStation((prev) => prev ?? selectable[0]?.code ?? null)
    } catch (e) {
      setError('Kunde inte hämta stationer.')
    }
  }

  async function fetchData(station, type) {
    if (!station) return
    try {
      const params = new URLSearchParams({ station, type })
      const historyParams = new URLSearchParams({ station, type, history: true })
      const [trainsRes, historicalRes, statsRes] = await Promise.all([
        fetch(`/train_announcements?${params}`),
        fetch(`/train_announcements?${historyParams}`),
        fetch(`/train_announcements/stats?${params}`),
      ])
      if (!trainsRes.ok || !historicalRes.ok || !statsRes.ok) throw new Error('Serverfel')
      const [trainsData, historicalData, statsData] = await Promise.all([
        trainsRes.json(),
        historicalRes.json(),
        statsRes.json(),
      ])
      setTrains(trainsData)
      setHistoricalTrains(historicalData)
      setHistoricalStats(statsData)
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError('Kunde inte hämta data. Kontrollera att servern körs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStations() }, [])

  useEffect(() => {
    if (!selectedStation) return
    setTrains([])
    setHistoricalTrains([])
    setSelectedDestination('')
    setStatsFromDate('')
    setLoading(true)
    fetchData(selectedStation, activityType)
    const interval = setInterval(() => fetchData(selectedStation, activityType), REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [selectedStation, activityType])

  useEffect(() => {
    if (historicalTrains.length === 0) return
    const dates = historicalTrains
      .map((t) => new Date(t.advertisedTimeAtLocation))
      .sort((a, b) => a - b)
    // Find last gap larger than 7 days
    let gapAfter = null
    for (let i = 1; i < dates.length; i++) {
      const diffDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)
      if (diffDays > 7) {
        gapAfter = dates[i]
      }
    }
    if (gapAfter) {
      setStatsFromDate(gapAfter.toISOString().slice(0, 10))
    }
  }, [historicalTrains])

  useEffect(() => {
    const interval = setInterval(fetchStations, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  async function runImport(hours) {
    setImporting(true)
    setImportResult(null)
    try {
      const res = await fetch(`/train_announcements/import?hours=${hours}`, { method: 'POST' })
      const data = await res.json()
      setImportResult(`✓ Import klar — ${data.processed} avgångar hämtade (${hours}h)`)
      fetchData(selectedStation, activityType)
    } catch (e) {
      setImportResult('Import misslyckades.')
    } finally {
      setImporting(false)
    }
  }

  const destinations = useMemo(() => {
    const unique = [...new Set(trains.map((t) => t.toLocation).filter(Boolean))]
    return unique.sort()
  }, [trains])

  const filteredTrains = useMemo(() => {
    if (!selectedDestination) return trains
    return trains.filter((t) => t.toLocation === selectedDestination)
  }, [trains, selectedDestination])

  const filteredHistoricalTrains = useMemo(() => {
    let result = historicalTrains
    if (selectedDestination) result = result.filter((t) => t.toLocation === selectedDestination)
    if (statsFromDate) result = result.filter((t) => new Date(t.advertisedTimeAtLocation) >= new Date(statsFromDate))
    return result
  }, [historicalTrains, selectedDestination, statsFromDate])

  const stats = useMemo(() => {
    const all = filteredHistoricalTrains
    if (all.length === 0) return historicalStats
    const totalCount = all.length
    const canceledCount = all.filter((t) => t.canceled === true).length
    const delayedCount = all.filter((t) => !t.canceled && t.delayMinutes != null && t.delayMinutes > 0).length
    const onTimeCount = totalCount - canceledCount - delayedCount
    const delayedOnly = all.filter((t) => !t.canceled && t.delayMinutes != null && t.delayMinutes > 0)
    const averageDelayMinutes = delayedOnly.length > 0
      ? delayedOnly.reduce((sum, t) => sum + t.delayMinutes, 0) / delayedOnly.length
      : 0
    const maxDelayMinutes = all.reduce((max, t) => t.delayMinutes != null ? Math.max(max, t.delayMinutes) : max, 0)
    return { totalCount, canceledCount, delayedCount, onTimeCount, averageDelayMinutes, maxDelayMinutes }
  }, [filteredHistoricalTrains, historicalStats])

  const typeLabel = activityType === 'avgang' ? 'avgångar' : 'ankomster'

  return (
    <div>
      <HeroSection />

      {/* Header */}
      <div style={styles.header}>
        <p style={styles.subtitle}>
          {selectedStation
            ? `${getStationName(selectedStation)} · ${typeLabel}${selectedDestination ? ` mot ${getStationName(selectedDestination)}` : ''}`
            : 'Laddar stationer...'}
        </p>
        {lastUpdated && (
          <div style={styles.liveIndicator}>
            <span style={styles.liveDot} />
            <span style={styles.liveText}>
              {lastUpdated.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      {stations.length > 0 && (
        <StationSelector
          stations={stations}
          selectedStation={selectedStation}
          activityType={activityType}
          destinations={destinations}
          selectedDestination={selectedDestination}
          onStationChange={setSelectedStation}
          onTypeChange={setActivityType}
          onDestinationChange={setSelectedDestination}
        />
      )}

      {importResult && <div style={styles.importResult}>{importResult}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Laddar data...</div>
      ) : (
        <>
          {/* Stats always visible */}
          <StatsCards stats={stats} />

          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'aktuellt' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('aktuellt')}
            >
              Aktuella avgångar
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'statistik' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('statistik')}
            >
              Statistik
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'aktuellt' && (
            <TrainTable trains={filteredTrains} activityType={activityType} />
          )}

          {activeTab === 'statistik' && (
            <div style={styles.statsLayout}>
              <div style={styles.dateFilter}>
                <label style={styles.dateLabel}>Visa statistik från:</label>
                <input
                  type="date"
                  value={statsFromDate}
                  onChange={(e) => setStatsFromDate(e.target.value)}
                  style={styles.dateInput}
                />
                {statsFromDate && (
                  <button onClick={() => setStatsFromDate('')} style={styles.clearBtn}>
                    Visa alla
                  </button>
                )}
              </div>
              <TrendLegend />
              <DelayTrendChart trains={filteredHistoricalTrains} />
              <BarLegend />
              <DelayChart trains={filteredHistoricalTrains} />
              <div className="chart-grid">
                <DelayByHourChart trains={filteredHistoricalTrains} />
                <DelayByTrainChart trains={filteredHistoricalTrains} />
              </div>
              <div className="chart-grid">
                <DelayByWeekdayChart trains={filteredHistoricalTrains} />
                <DeviationChart trains={filteredHistoricalTrains} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  subtitle: {
    color: '#888',
    marginTop: '0.3rem',
    fontSize: '0.9rem',
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  liveDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#16a34a',
    boxShadow: '0 0 0 2px #bbf7d0',
    animation: 'pulse 2s infinite',
  },
  liveText: {
    fontSize: '0.82rem',
    color: '#16a34a',
    fontWeight: '500',
  },
  importResult: {
    background: '#f0fdf4',
    color: '#166534',
    padding: '0.7rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.88rem',
    fontWeight: '500',
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    color: '#888',
    fontSize: '1rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.25rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0',
  },
  tab: {
    padding: '0.6rem 1.2rem',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#888',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#1a5c38',
    borderBottom: '2px solid #1a5c38',
  },
  statsLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  dateFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: '#fff',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  dateLabel: {
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  dateInput: {
    padding: '0.4rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    color: '#374151',
  },
  clearBtn: {
    padding: '0.4rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#6b7280',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
}
