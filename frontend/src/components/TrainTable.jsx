import { useState } from 'react'
import { getStationName } from '../utils/stationNames'

const PAGE_SIZE = 25

export default function TrainTable({ trains, activityType }) {
  const [sortCol, setSortCol] = useState('advertisedTimeAtLocation')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  if (!trains || trains.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🚉</div>
        <div style={styles.emptyTitle}>Inga tåg hittades</div>
        <div style={styles.emptyText}>Det finns ingen trafikdata för vald station och tidsperiod.</div>
      </div>
    )
  }

  function handleSort(col) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sorted = [...trains].sort((a, b) => {
    let av = a[sortCol] ?? ''
    let bv = b[sortCol] ?? ''
    if (sortCol === 'advertisedTimeAtLocation' || sortCol === 'estimatedTimeAtLocation') {
      av = new Date(av)
      bv = new Date(bv)
    } else {
      av = String(av).toLowerCase()
      bv = String(bv).toLowerCase()
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Inject date headers inline
  const rows = []
  let lastDate = null
  for (const train of paginated) {
    const date = new Date(train.advertisedTimeAtLocation).toLocaleDateString('sv-SE', {
      timeZone: 'Europe/Stockholm',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (date !== lastDate) {
      rows.push({ type: 'header', date })
      lastDate = date
    }
    rows.push({ type: 'train', train })
  }

  const locationHeader = activityType === 'avgang' ? 'Destination' : 'Från'

  const cols = [
    { key: 'advertisedTrainIden', label: 'Tåg' },
    { key: 'toLocation', label: locationHeader },
    { key: 'advertisedTimeAtLocation', label: 'Planerad' },
    { key: 'estimatedTimeAtLocation', label: 'Beräknad' },
    { key: 'trackAtLocation', label: 'Spår' },
    { key: 'delayMinutes', label: 'Status' },
    { key: 'deviation', label: 'Avvikelse' },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h2 style={styles.title}>{activityType === 'avgang' ? 'Avgångar' : 'Ankomster'}</h2>
        <span style={styles.count}>{sorted.length} tåg</span>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {cols.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...styles.th,
                    ...(col.key === 'deviation' ? {} : { cursor: 'pointer', userSelect: 'none' }),
                  }}
                  onClick={col.key !== 'deviation' ? () => handleSort(col.key) : undefined}
                >
                  {col.label}
                  {sortCol === col.key && (
                    <span style={styles.sortArrow}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              if (row.type === 'header') {
                return (
                  <tr key={`h-${row.date}`}>
                    <td colSpan={7} style={styles.dateHeader}>
                      {capitalize(row.date)}
                    </td>
                  </tr>
                )
              }
              const { train } = row
              const status = getStatus(train)
              return (
                <tr key={train.activityId} style={getRowStyle(train)}>
                  <td style={styles.td}>{train.advertisedTrainIden}</td>
                  <td style={styles.td}>{train.toLocation ? getStationName(train.toLocation) : '—'}</td>
                  <td style={styles.td}>{formatTime(train.advertisedTimeAtLocation)}</td>
                  <td style={styles.td}>
                    {train.estimatedTimeAtLocation ? formatTime(train.estimatedTimeAtLocation) : '—'}
                  </td>
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

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Föregående
          </button>
          <span style={styles.pageInfo}>
            Sida {page} av {totalPages}
          </span>
          <button
            style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Nästa →
          </button>
        </div>
      )}
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
  topBar: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
  },
  count: {
    fontSize: '0.85rem',
    color: '#9ca3af',
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
  sortArrow: {
    color: '#1a5c38',
    fontWeight: '700',
  },
  td: {
    padding: '0.65rem 0.8rem',
    borderBottom: '1px solid #f3f4f6',
    whiteSpace: 'nowrap',
  },
  dateHeader: {
    padding: '0.6rem 0.8rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#1a5c38',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    background: '#f0fdf4',
    borderBottom: '1px solid #bbf7d0',
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
    padding: '3rem 2rem',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
  emptyTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.4rem',
  },
  emptyText: {
    fontSize: '0.88rem',
    color: '#9ca3af',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
  },
  pageBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  pageInfo: {
    fontSize: '0.85rem',
    color: '#6b7280',
  },
}
