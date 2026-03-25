import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

export default function DelayByHourChart({ trains }) {
  if (!trains || trains.length === 0) return null

  const byHour = {}
  for (let h = 0; h < 24; h++) {
    byHour[h] = { total: 0, delayed: 0, count: 0 }
  }

  trains.forEach((train) => {
    const hour = new Date(train.advertisedTimeAtLocation).toLocaleString('sv-SE', {
      hour: 'numeric',
      timeZone: 'Europe/Stockholm',
    })
    const h = parseInt(hour)
    if (isNaN(h)) return
    byHour[h].count += 1
    if (train.delayMinutes != null && train.delayMinutes > 0) {
      byHour[h].total += train.delayMinutes
      byHour[h].delayed += 1
    }
  })

  const data = Object.entries(byHour)
    .filter(([, val]) => val.count > 0)
    .map(([hour, val]) => ({
      hour: `${hour}:00`,
      snittFörsening: val.delayed > 0 ? Math.round(val.total / val.delayed) : 0,
      antalTåg: val.count,
    }))

  const hasData = data.some((d) => d.snittFörsening > 0)

  return (
    <div style={styles.container}>
      <h2>Försening per timme</h2>
      {!hasData ? (
        <div style={styles.empty}>Inga förseningar registrerade</div>
      ) : (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} unit=" min" />
          <Tooltip
            formatter={(value, name) => [
              `${value} min`,
              'Snittförsening',
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
