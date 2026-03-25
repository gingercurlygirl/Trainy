export default function StatsCards({ stats }) {
  if (!stats) return null

  const delayPercent = stats.totalCount > 0
    ? Math.round((stats.delayedCount / stats.totalCount) * 100)
    : 0

  const groups = [
    {
      title: 'Trafik',
      color: '#1a5c38',
      border: '#dcfce7',
      items: [
        { label: 'Totalt', value: stats.totalCount },
        { label: 'I tid', value: stats.onTimeCount, color: '#16a34a' },
        { label: 'Inställda', value: stats.canceledCount, color: '#dc2626' },
      ],
    },
    {
      title: 'Förseningar',
      color: '#ea580c',
      border: '#ffedd5',
      items: [
        { label: 'Antal försenade', value: stats.delayedCount },
        { label: 'Andel försenade', value: `${delayPercent}%`, color: '#b45309' },
      ],
    },
    {
      title: 'Försening',
      color: '#7c3aed',
      border: '#ede9fe',
      items: [
        { label: 'Snitt', value: `${stats.averageDelayMinutes.toFixed(1)} min` },
        { label: 'Max', value: `${stats.maxDelayMinutes} min`, color: '#b91c1c' },
      ],
    },
  ]

  return (
    <div style={styles.grid}>
      {groups.map((group) => (
        <div key={group.title} style={{ ...styles.card, borderTop: `3px solid ${group.border}` }}>
          <div style={{ ...styles.groupTitle, color: group.color }}>{group.title}</div>
          <div style={styles.itemRow}>
            {group.items.map((item, i) => (
              <div key={item.label} style={{ ...styles.item, borderLeft: i > 0 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ ...styles.value, color: item.color || group.color }}>{item.value}</div>
                <div style={styles.label}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.75rem',
    marginBottom: '2rem',
  },
  card: {
    background: '#fff',
    borderRadius: '14px',
    padding: '0.9rem 1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  groupTitle: {
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.6rem',
  },
  itemRow: {
    display: 'flex',
    gap: '0',
  },
  item: {
    flex: 1,
    paddingLeft: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  value: {
    fontSize: '1.5rem',
    fontWeight: '800',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  label: {
    fontSize: '0.7rem',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
}
