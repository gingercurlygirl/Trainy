export default function StatsCards({ stats }) {
  if (!stats) return null

  const delayPercent = stats.totalCount > 0
    ? Math.round((stats.delayedCount / stats.totalCount) * 100)
    : 0

  const cards = [
    { label: 'Totalt antal tåg', value: stats.totalCount, color: '#1a5c38', bg: '#f0fdf4', icon: '🚆' },
    { label: 'I tid', value: stats.onTimeCount, color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
    { label: 'Försenade', value: stats.delayedCount, color: '#ea580c', bg: '#fff7ed', icon: '⏱️' },
    { label: 'Inställda', value: stats.canceledCount, color: '#dc2626', bg: '#fff1f2', icon: '❌' },
    { label: 'Andel försenade', value: `${delayPercent}%`, color: '#b45309', bg: '#fffbeb', icon: '📊' },
    { label: 'Snittförsening', value: `${stats.averageDelayMinutes.toFixed(1)} min`, color: '#7c3aed', bg: '#faf5ff', icon: '📈' },
    { label: 'Max försening', value: `${stats.maxDelayMinutes} min`, color: '#b91c1c', bg: '#fff1f2', icon: '⚠️' },
  ]

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} style={{ ...styles.card, background: card.bg }}>
          <div style={styles.icon}>{card.icon}</div>
          <div style={{ ...styles.value, color: card.color }}>{card.value}</div>
          <div style={styles.label}>{card.label}</div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  card: {
    borderRadius: '14px',
    padding: '1.2rem 1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '1.4rem',
    marginBottom: '0.4rem',
  },
  value: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '0.3rem',
  },
  label: {
    fontSize: '0.78rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
}
