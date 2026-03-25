import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { getStationName } from '../utils/stationNames'

export default function DelayChart({ trains }) {
  if (!trains || trains.length === 0) return null

  // Group by destination and calculate average delay
  const byDestination = trains.reduce((acc, train) => {
    const dest = train.toLocation || 'Okänd'
    if (!acc[dest]) acc[dest] = { total: 0, count: 0, delayed: 0 }
    if (train.delayMinutes != null && train.delayMinutes > 0) {
      acc[dest].total += train.delayMinutes
      acc[dest].delayed += 1
    }
    acc[dest].count += 1
    return acc
  }, {})

  const data = Object.entries(byDestination).map(([dest, val]) => ({
    destination: getStationName(dest),
    snittFörsening: val.delayed > 0 ? Math.round(val.total / val.delayed) : 0,
    antalFörsenade: val.delayed,
  })).sort((a, b) => b.snittFörsening - a.snittFörsening)

  return (
    <div style={styles.container}>
      <h2>Försening per destination (minuter)</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="destination" angle={-30} textAnchor="end" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit=" min" />
          <Tooltip
            formatter={(value, name) => [
              name === 'snittFörsening' ? `${value} min` : value,
              name === 'snittFörsening' ? 'Snittförsening' : 'Antal försenade',
            ]}
          />
          <Bar dataKey="snittFörsening" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.snittFörsening > 10 ? '#dc2626' : '#1a5c38'} />
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
}
