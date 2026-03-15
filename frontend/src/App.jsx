import { useEffect, useState, useMemo } from 'react'
import StatsCards from './components/StatsCards'
import DelayChart from './components/DelayChart'
import TrainTable from './components/TrainTable'
import StationSelector from './components/StationSelector'
import { getStationName, MALARTAG_STATIONS } from './utils/stationNames'

const REFRESH_INTERVAL = 60_000

export default function App() {
  const [selectedStation, setSelectedStation] = useState(MALARTAG_STATIONS[0].code)
  const [activityType, setActivityType] = useState('avgang')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [trains, setTrains] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  async function fetchData(station, type) {
    if (!station) return
    try {
      const params = new URLSearchParams({ station, type })
      const [trainsRes, statsRes] = await Promise.all([
        fetch(`/train_announcements?${params}`),
        fetch(`/train_announcements/stats?${params}`),
      ])
      if (!trainsRes.ok || !statsRes.ok) throw new Error('Serverfel')
      const [trainsData, statsData] = await Promise.all([
        trainsRes.json(),
        statsRes.json(),
      ])
      setTrains(trainsData)
      setStats(statsData)
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError('Kunde inte hämta data. Kontrollera att servern körs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedStation) return
    setTrains([])
    setStats(null)
    setSelectedDestination('')
    setLoading(true)
    fetchData(selectedStation, activityType)
    const interval = setInterval(() => fetchData(selectedStation, activityType), REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [selectedStation, activityType])

  // Unique destinations from loaded trains
  const destinations = useMemo(() => {
    const unique = [...new Set(trains.map((t) => t.toLocation).filter(Boolean))]
    return unique.sort()
  }, [trains])

  // Filter trains by destination if selected
  const filteredTrains = useMemo(() => {
    if (!selectedDestination) return trains
    return trains.filter((t) => t.toLocation === selectedDestination)
  }, [trains, selectedDestination])

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

      <StationSelector
          selectedStation={selectedStation}
          activityType={activityType}
          destinations={destinations}
          selectedDestination={selectedDestination}
          onStationChange={setSelectedStation}
          onTypeChange={setActivityType}
          onDestinationChange={setSelectedDestination}
        />

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
