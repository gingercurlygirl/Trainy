export default function StatsCards({ stats }) {
  if (!stats) return null

  const delayPercent = stats.totalCount > 0
    ? Math.round((stats.delayedCount / stats.totalCount) * 100)
    : 0

  const cards = [
    { label: 'Totalt antal avgångar', value: stats.totalCount, color: '#4f46e5' },
    { label: 'I tid', value: stats.onTimeCount, color: '#16a34a' },
    { label: 'Försenade', value: stats.delayedCount, color: '#ea580c' },
    { label: 'Inställda', value: stats.canceledCount, color: '#dc2626' },
    { label: 'Andel försenade', value: `${delayPercent}%`, color: '#b45309' },
    { label: 'Snittförsening', value: `${stats.averageDelayMinutes.toFixed(1)} min`, color: '#7c3aed' },
    { label: 'Max försening', value: `${stats.maxDelayMinutes} min`, color: '#b91c1c' },
  ]

  return (
    <div style={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} style={styles.card}>
          <div style={{ ...styles.value, color: card.color }}>{card.value}</div>
          <div style={styles.label}>{card.label}</div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.2rem 1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  value: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '0.3rem',
  },
  label: {
    fontSize: '0.78rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
}
