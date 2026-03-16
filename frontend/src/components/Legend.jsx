export default function Legend() {
  return (
    <div style={styles.container}>
      <span style={styles.title}>Färgförklaring:</span>
      <div style={styles.items}>
        <div style={styles.item}>
          <span style={{ ...styles.dot, background: '#16a34a' }} />
          <span>I tid</span>
        </div>
        <div style={styles.item}>
          <span style={{ ...styles.dot, background: '#ea580c' }} />
          <span>Försenad</span>
        </div>
        <div style={styles.item}>
          <span style={{ ...styles.dot, background: '#dc2626' }} />
          <span>Inställd</span>
        </div>
        <div style={styles.divider} />
        <span style={styles.subtitle}>Stapeldiagram — snittförsening:</span>
        <div style={styles.item}>
          <span style={{ ...styles.dot, background: '#4f46e5' }} />
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
    padding: '1rem 1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  subtitle: {
    fontSize: '0.78rem',
    color: '#9ca3af',
    whiteSpace: 'nowrap',
  },
  items: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
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
  divider: {
    width: '1px',
    height: '20px',
    background: '#e5e7eb',
  },
}
