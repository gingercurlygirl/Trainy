import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

function getWeekStart(dateStr) {
  const d = new Date(dateStr)
  // Convert to Stockholm time
  const local = new Date(d.toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' }))
  const day = local.getDay() // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day) // shift to Monday
  local.setDate(local.getDate() + diff)
  return local.toISOString().slice(0, 10)
}

function formatWeekLabel(isoDate) {
  const d = new Date(isoDate + 'T12:00:00')
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

export default function DelayTrendChart({ trains }) {
  if (!trains || trains.length === 0) return null

  const byWeek = {}

  trains.forEach((train) => {
    const week = getWeekStart(train.advertisedTimeAtLocation)
    if (!byWeek[week]) byWeek[week] = { total: 0, delayed: 0, canceled: 0, count: 0 }
    byWeek[week].count += 1
    if (train.canceled === true) {
      byWeek[week].canceled += 1
    } else if (train.delayMinutes != null && train.delayMinutes > 0) {
      byWeek[week].total += train.delayMinutes
      byWeek[week].delayed += 1
    }
  })

  const data = Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, val]) => ({
      vecka: formatWeekLabel(week),
      snittFörsening: val.delayed > 0 ? Math.round(val.total / val.delayed) : 0,
      försenadeProcent: val.count > 0 ? Math.round((val.delayed / val.count) * 100) : 0,
      inställdaProcent: val.count > 0 ? Math.round((val.canceled / val.count) * 100) : 0,
      antalTåg: val.count,
    }))

  if (data.length < 2) {
    return (
      <div style={styles.container}>
        <h2>Trend per vecka</h2>
        <div style={styles.empty}>Behöver data från minst 2 veckor</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2>Trend per vecka</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="vecka" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} unit="%" />
          <Tooltip
            formatter={(value, name) => [`${value}%`, name]}
            labelFormatter={(label) => {
              const d = data.find((x) => x.vecka === label)
              return `Vecka fr. ${label} (${d?.antalTåg} tåg)`
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="försenadeProcent"
            name="Försenade %"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="inställdaProcent"
            name="Inställda %"
            stroke="#dc2626"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            strokeDasharray="5 5"
          />
        </LineChart>
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
    marginBottom: '1.5rem',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#bbb',
    fontSize: '0.9rem',
  },
}
