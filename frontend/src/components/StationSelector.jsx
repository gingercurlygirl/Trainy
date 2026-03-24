import { getStationName } from '../utils/stationNames'

export default function StationSelector({
  stations,
  selectedStation,
  activityType,
  destinations,
  selectedDestination,
  onStationChange,
  onTypeChange,
  onDestinationChange,
}) {
  return (
    <div style={styles.container}>
      <div style={styles.group}>
        <label style={styles.label}>Station</label>
        <select
          value={selectedStation ?? ''}
          onChange={(e) => onStationChange(e.target.value)}
          style={styles.select}
        >
          {stations.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Typ</label>
        <div style={styles.toggle}>
          <button
            style={{ ...styles.toggleBtn, ...(activityType === 'avgang' ? styles.active : {}) }}
            onClick={() => onTypeChange('avgang')}
          >
            Avgångar
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(activityType === 'ankomst' ? styles.active : {}) }}
            onClick={() => onTypeChange('ankomst')}
          >
            Ankomster
          </button>
        </div>
      </div>

      {destinations.length > 0 && (
        <div style={styles.group}>
          <label style={styles.label}>Riktning</label>
          <select
            value={selectedDestination}
            onChange={(e) => onDestinationChange(e.target.value)}
            style={styles.select}
          >
            <option value="">Alla destinationer</option>
            {destinations.map((d) => (
              <option key={d} value={d}>{getStationName(d)}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-end',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    minWidth: '180px',
  },
  toggle: {
    display: 'flex',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    overflow: 'hidden',
  },
  toggleBtn: {
    padding: '0.5rem 1.2rem',
    border: 'none',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#555',
    transition: 'all 0.15s',
  },
  active: {
    background: '#1a5c38',
    color: '#fff',
  },
}
