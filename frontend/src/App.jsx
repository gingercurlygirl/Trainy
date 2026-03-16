import { useEffect, useState, useMemo } from 'react'
import StatsCards from './components/StatsCards'
import DelayChart from './components/DelayChart'
import DelayByHourChart from './components/DelayByHourChart'
import DelayByTrainChart from './components/DelayByTrainChart'
import DelayByWeekdayChart from './components/DelayByWeekdayChart'
import DelayTrendChart from './components/DelayTrendChart'
import TrainTable from './components/TrainTable'
import StationSelector from './components/StationSelector'
import Legend from './components/Legend'
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

  async function fetchStations() {
    try {
      const res = await fetch('/train_announcements/stations')
      const data = await res.json()
      populateStationMap(data)
      setStations(data)
      setSelectedStation((prev) => prev ?? data[0]?.code ?? null)
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
    setLoading(true)
    fetchData(selectedStation, activityType)
    const interval = setInterval(() => fetchData(selectedStation, activityType), REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [selectedStation, activityType])

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
    if (!selectedDestination) return historicalTrains
    return historicalTrains.filter((t) => t.toLocation === selectedDestination)
  }, [historicalTrains, selectedDestination])

  const stats = historicalStats

  const typeLabel = activityType === 'avgang' ? 'avgångar' : 'ankomster'

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Mälartåg</h1>
          <p style={styles.subtitle}>
            {selectedStation
              ? `${getStationName(selectedStation)} · ${typeLabel}${selectedDestination ? ` mot ${getStationName(selectedDestination)}` : ''}`
              : 'Laddar stationer...'}
          </p>
        </div>
        <div style={styles.meta}>
          {lastUpdated && (
            <div style={styles.liveIndicator}>
              <span style={styles.liveDot} />
              <span style={styles.liveText}>
                {lastUpdated.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          <button onClick={() => fetchData(selectedStation, activityType)} style={styles.refreshBtn}>
            Uppdatera
          </button>
          <button onClick={() => runImport(96)} disabled={importing} style={styles.importBtn}>
            {importing ? 'Importerar...' : 'Hämta historik (96h)'}
          </button>
        </div>
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
            <div>
              <Legend />
              <DelayTrendChart trains={filteredHistoricalTrains} />
              <DelayChart trains={filteredHistoricalTrains} />
              <div style={styles.chartGrid}>
                <DelayByHourChart trains={filteredHistoricalTrains} />
                <DelayByTrainChart trains={filteredHistoricalTrains} />
              </div>
              <DelayByWeekdayChart trains={filteredHistoricalTrains} />
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
  title: {
    fontSize: '1.7rem',
    fontWeight: '700',
  },
  subtitle: {
    color: '#888',
    marginTop: '0.3rem',
    fontSize: '0.9rem',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
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
  refreshBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  importBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    border: '1px solid #a5b4fc',
    background: '#eef2ff',
    color: '#4f46e5',
    cursor: 'pointer',
    fontSize: '0.85rem',
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
    color: '#4f46e5',
    borderBottom: '2px solid #4f46e5',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
}
