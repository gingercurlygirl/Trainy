import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const WEEKDAYS = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag']

export default function DelayByWeekdayChart({ trains }) {
  if (!trains || trains.length === 0) return null

  const byDay = Array.from({ length: 7 }, () => ({ total: 0, delayed: 0, count: 0 }))

  trains.forEach((train) => {
    const day = new Date(train.advertisedTimeAtLocation).toLocaleDateString('sv-SE', {
      weekday: 'long',
      timeZone: 'Europe/Stockholm',
    })
    // toLocaleDateString returns Swedish weekday name, map to index via Date
    const d = new Date(train.advertisedTimeAtLocation)
    const idx = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', timeZone: 'Europe/Stockholm' })
      .format(d)
    const dayIndex = ['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'].indexOf(idx.toLowerCase())
    if (dayIndex === -1) return
    byDay[dayIndex].count += 1
    if (train.delayMinutes != null && train.delayMinutes > 0) {
      byDay[dayIndex].total += train.delayMinutes
      byDay[dayIndex].delayed += 1
    }
  })

  // Start from Monday (index 1) to Sunday (index 0), Swedish week order
  const order = [1, 2, 3, 4, 5, 6, 0]
  const data = order
    .filter((i) => byDay[i].count > 0)
    .map((i) => ({
      dag: WEEKDAYS[i],
      snittFörsening: byDay[i].delayed > 0 ? Math.round(byDay[i].total / byDay[i].delayed) : 0,
      försenadeProcent: byDay[i].count > 0 ? Math.round((byDay[i].delayed / byDay[i].count) * 100) : 0,
      antalTåg: byDay[i].count,
    }))

  const hasData = data.some((d) => d.snittFörsening > 0)

  return (
    <div style={styles.container}>
      <h2>Försening per veckodag</h2>
      {!hasData ? (
        <div style={styles.empty}>Inga förseningar registrerade</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="dag" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit=" min" />
            <Tooltip
              formatter={(value, name) => [`${value} min`, 'Snittförsening']}
              labelFormatter={(label) => {
                const d = data.find((x) => x.dag === label)
                return `${label} (${d?.antalTåg} tåg, ${d?.försenadeProcent}% försenade)`
              }}
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
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#bbb',
    fontSize: '0.9rem',
  },
}
