import { useEffect, useState, useMemo } from 'react'
import StatsCards from './components/StatsCards'
import DelayChart from './components/DelayChart'
import TrainTable from './components/TrainTable'
import StationSelector from './components/StationSelector'
import { getStationName, populateStationMap } from './utils/stationNames'

const REFRESH_INTERVAL = 60_000

export default function App() {
  const [stations, setStations] = useState([])
  const [selectedStation, setSelectedStation] = useState(null)
  const [activityType, setActivityType] = useState('avgang')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

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
      const res = await fetch(`/train_announcements?${params}`)
      if (!res.ok) throw new Error('Serverfel')
      const data = await res.json()
      setTrains(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError('Kunde inte hämta data. Kontrollera att servern körs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStations()
  }, [])

  useEffect(() => {
    if (!selectedStation) return
    setTrains([])
    setSelectedDestination('')
    setLoading(true)
    fetchData(selectedStation, activityType)
    const interval = setInterval(() => fetchData(selectedStation, activityType), REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [selectedStation, activityType])

  // Refresh station list every 60s to pick up new stations
  useEffect(() => {
    const interval = setInterval(fetchStations, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const destinations = useMemo(() => {
    const unique = [...new Set(trains.map((t) => t.toLocation).filter(Boolean))]
    return unique.sort()
  }, [trains])

  const filteredTrains = useMemo(() => {
    if (!selectedDestination) return trains
    return trains.filter((t) => t.toLocation === selectedDestination)
  }, [trains, selectedDestination])

  const stats = useMemo(() => computeStats(filteredTrains), [filteredTrains])

  const typeLabel = activityType === 'avgang' ? 'avgångar' : 'ankomster'

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1>Mälartåg — Förseningsstatistik</h1>
          <p style={styles.subtitle}>
            {selectedStation
              ? `${getStationName(selectedStation)} · ${typeLabel}${selectedDestination ? ` mot ${getStationName(selectedDestination)}` : ''}`
              : 'Laddar stationer...'}
          </p>
        </div>
        <div style={styles.meta}>
          {lastUpdated && (
            <span style={styles.updated}>
              Uppdaterad {lastUpdated.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={() => fetchData(selectedStation, activityType)} style={styles.refreshBtn}>
            Uppdatera
          </button>
        </div>
      </div>

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

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Laddar data...</div>
      ) : (
        <>
          <StatsCards stats={stats} />
          <DelayChart trains={filteredTrains} />
          <TrainTable trains={filteredTrains} activityType={activityType} />
        </>
      )}
    </div>
  )
}

function computeStats(trains) {
  const totalCount = trains.length
  const delayedCount = trains.filter((t) => t.delayMinutes != null && t.delayMinutes > 0).length
  const onTimeCount = totalCount - delayedCount
  const delays = trains.filter((t) => t.delayMinutes != null && t.delayMinutes > 0).map((t) => t.delayMinutes)
  const averageDelayMinutes = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0
  const maxDelayMinutes = delays.length > 0 ? Math.max(...delays) : 0
  return { totalCount, delayedCount, onTimeCount, averageDelayMinutes, maxDelayMinutes }
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
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
  },
  updated: {
    fontSize: '0.82rem',
    color: '#999',
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
}
