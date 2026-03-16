import { getStationName } from '../utils/stationNames'

export default function TrainTable({ trains, activityType }) {
  if (!trains || trains.length === 0) {
    return <div style={styles.empty}>Inga avgångar hittades.</div>
  }

  const sorted = [...trains].sort(
    (a, b) => new Date(a.advertisedTimeAtLocation) - new Date(b.advertisedTimeAtLocation)
  )

  // Group by date
  const grouped = sorted.reduce((acc, train) => {
    const date = new Date(train.advertisedTimeAtLocation).toLocaleDateString('sv-SE', {
      timeZone: 'Europe/Stockholm',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(train)
    return acc
  }, {})

  const locationHeader = activityType === 'avgang' ? 'Destination' : 'Från'

  return (
    <div style={styles.container}>
      <h2>{activityType === 'avgang' ? 'Avgångar' : 'Ankomster'}</h2>
      {Object.entries(grouped).map(([date, dayTrains]) => (
        <div key={date} style={styles.dateGroup}>
          <div style={styles.dateHeader}>{capitalize(date)}</div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tåg</th>
                  <th style={styles.th}>{locationHeader}</th>
                  <th style={styles.th}>Planerad</th>
                  <th style={styles.th}>Beräknad</th>
                  <th style={styles.th}>Spår</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Avvikelse</th>
                </tr>
              </thead>
              <tbody>
                {dayTrains.map((train) => {
                  const status = getStatus(train)
                  return (
                    <tr key={train.activityId} style={getRowStyle(train)}>
                      <td style={styles.td}>{train.advertisedTrainIden}</td>
                      <td style={styles.td}>{train.toLocation ? getStationName(train.toLocation) : '—'}</td>
                      <td style={styles.td}>{formatTime(train.advertisedTimeAtLocation)}</td>
                      <td style={styles.td}>{train.estimatedTimeAtLocation ? formatTime(train.estimatedTimeAtLocation) : '—'}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{train.trackAtLocation}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...status.style }}>{status.label}</span>
                      </td>
                      <td style={{ ...styles.td, fontSize: '0.8rem', color: '#666' }}>
                        {train.deviation || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function getRowStyle(train) {
  if (train.canceled === true) return { background: '#fff1f2' }
  if (train.delayMinutes != null && train.delayMinutes > 0) return { background: '#fffbeb' }
  return {}
}

function getStatus(train) {
  if (train.canceled === true) {
    return { label: 'Inställd', style: { background: '#fee2e2', color: '#991b1b' } }
  }
  if (train.delayMinutes != null && train.delayMinutes > 0) {
    return { label: `+${train.delayMinutes} min`, style: { background: '#fef3c7', color: '#92400e' } }
  }
  return { label: 'I tid', style: { background: '#dcfce7', color: '#166534' } }
}

function formatTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Stockholm',
  })
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  dateGroup: {
    marginBottom: '1.5rem',
  },
  dateHeader: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '0.5rem 0',
    borderBottom: '2px solid #e0e7ff',
    marginBottom: '0.5rem',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.6rem 0.8rem',
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.65rem 0.8rem',
    borderBottom: '1px solid #f3f4f6',
    whiteSpace: 'nowrap',
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  empty: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    color: '#888',
  },
}
