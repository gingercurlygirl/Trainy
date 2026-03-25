export default function StatsCards({ stats }) {
  if (!stats) return null

  const delayPercent = stats.totalCount > 0
    ? Math.round((stats.delayedCount / stats.totalCount) * 100)
    : 0

  const cards = [
    { label: 'Totalt antal tåg', value: stats.totalCount, color: '#1a5c38', iconBg: '#dcfce7', icon: '🚆' },
    { label: 'I tid', value: stats.onTimeCount, color: '#16a34a', iconBg: '#dcfce7', icon: '✓' },
    { label: 'Försenade', value: stats.delayedCount, color: '#ea580c', iconBg: '#ffedd5', icon: '⏱' },
    { label: 'Inställda', value: stats.canceledCount, color: '#dc2626', iconBg: '#fee2e2', icon: '✕' },
    { label: 'Andel försenade', value: `${delayPercent}%`, color: '#b45309', iconBg: '#fef3c7', icon: '%' },
    { label: 'Snittförsening', value: `${stats.averageDelayMinutes.toFixed(1)} min`, color: '#7c3aed', iconBg: '#ede9fe', icon: '∅' },
    { label: 'Max försening', value: `${stats.maxDelayMinutes} min`, color: '#b91c1c', iconBg: '#fee2e2', icon: '↑' },
  ]

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} style={styles.card}>
          <div style={{ ...styles.iconCircle, background: card.iconBg, color: card.color }}>
            {card.icon}
          </div>
          <div style={{ ...styles.value, color: card.color }}>{card.value}</div>
          <div style={styles.label}>{card.label}</div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '14px',
    padding: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconCircle: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
    fontWeight: '700',
    marginBottom: '0.2rem',
  },
  value: {
    fontSize: '1.6rem',
    fontWeight: '800',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  label: {
    fontSize: '0.73rem',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    textAlign: 'center',
  },
  bar: {
    width: '100%',
    height: '3px',
    borderRadius: '999px',
    marginTop: '0.6rem',
    overflow: 'hidden',
  },
  barFill: {
    width: '40%',
    height: '100%',
    borderRadius: '999px',
    opacity: 0.6,
  },
}
