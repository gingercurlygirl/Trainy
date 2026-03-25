export function TrendLegend() {
  return (
    <div style={styles.container}>
      <span style={styles.title}>Förklaring</span>
      <div style={styles.items}>
        <div style={styles.item}>
          <span style={{ ...styles.line, background: '#1a5c38' }} />
          <span>Andel försenade (%)</span>
        </div>
        <div style={styles.item}>
          <span style={{ ...styles.line, background: 'none', borderTop: '2px dashed #dc2626' }} />
          <span>Andel inställda (%)</span>
        </div>
      </div>
    </div>
  )
}

export function BarLegend() {
  return (
    <div style={styles.container}>
      <span style={styles.title}>Stapeldiagram — snittförsening</span>
      <div style={styles.items}>
        <div style={styles.item}>
          <span style={{ ...styles.dot, background: '#1a5c38' }} />
          <span>0–5 min</span>
        </div>
        <div style={styles.item}>
          <span style={{ ...styles.dot, background: '#ea580c' }} />
          <span>5–10 min</span>
        </div>
        <div style={styles.item}>
          <span style={{ ...styles.dot, background: '#dc2626' }} />
          <span>Över 10 min</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  items: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    flexWrap: 'wrap',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#374151',
  },
  dot: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  line: {
    display: 'inline-block',
    width: '18px',
    height: '3px',
    borderRadius: '2px',
    flexShrink: 0,
  },
}
