import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

export default function DelayByTrainChart({ trains }) {
  if (!trains || trains.length === 0) return null

  const byTrain = trains.reduce((acc, train) => {
    const id = train.advertisedTrainIden
    if (!id) return acc
    if (!acc[id]) acc[id] = { total: 0, delayed: 0, count: 0 }
    acc[id].count += 1
    if (train.delayMinutes != null && train.delayMinutes > 0) {
      acc[id].total += train.delayMinutes
      acc[id].delayed += 1
    }
    return acc
  }, {})

  const data = Object.entries(byTrain)
    .map(([train, val]) => ({
      train,
      snittFörsening: val.delayed > 0 ? Math.round(val.total / val.delayed) : 0,
      antalFörsenade: val.delayed,
      antalTåg: val.count,
    }))
    .filter((d) => d.snittFörsening > 0)
    .sort((a, b) => b.snittFörsening - a.snittFörsening)
    .slice(0, 10)

  return (
    <div style={styles.container}>
      <h2>Mest försenade tåg (snitt per avgång)</h2>
      {data.length === 0 ? (
        <div style={styles.empty}>Inga förseningar registrerade</div>
      ) : (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="train" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit=" min" />
          <Tooltip
            formatter={(value, name) => [
              name === 'snittFörsening' ? `${value} min` : value,
              name === 'snittFörsening' ? 'Snittförsening' : 'Antal försenade avgångar',
            ]}
          />
          <Bar dataKey="snittFörsening" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.snittFörsening > 10 ? '#dc2626' : entry.snittFörsening > 5 ? '#ea580c' : '#1a5c38'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      )}
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
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#bbb',
    fontSize: '0.9rem',
  },
}
