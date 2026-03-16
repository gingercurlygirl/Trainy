import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = ['#4f46e5', '#7c3aed', '#a21caf', '#be185d', '#dc2626', '#ea580c', '#d97706', '#65a30d', '#0891b2', '#0284c7']

export default function DeviationChart({ trains }) {
  if (!trains || trains.length === 0) return null

  const counts = {}
  trains.forEach((t) => {
    if (!t.deviation) return
    // Split combined deviations like "Fordonsfel; Kort tåg"
    t.deviation.split(';').forEach((d) => {
      const key = d.trim()
      if (key) counts[key] = (counts[key] || 0) + 1
    })
  })

  const data = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([reason, count]) => ({ reason, count }))

  if (data.length === 0) return null

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div style={styles.container}>
      <h2>Vanligaste avvikelser</h2>
      <p style={styles.subtitle}>{total} avvikelser registrerade totalt</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, left: 110, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="reason" tick={{ fontSize: 12 }} width={105} />
          <Tooltip
            formatter={(value) => [`${value} gånger`, 'Antal']}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: '0',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginTop: '-0.5rem',
    marginBottom: '1rem',
  },
}
