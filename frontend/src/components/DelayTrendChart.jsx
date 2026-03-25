import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'

function getPeriodStart(dateStr) {
  const d = new Date(dateStr)
  const local = new Date(d.toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' }))
  // Swedish week: Mon=0 ... Sun=6
  const sweDay = (local.getDay() + 6) % 7
  // Mon-Wed → period starts Monday, Thu-Sun → period starts Thursday
  const daysBack = sweDay < 3 ? sweDay : sweDay - 3
  local.setDate(local.getDate() - daysBack)
  const y = local.getFullYear()
  const mo = String(local.getMonth() + 1).padStart(2, '0')
  const dy = String(local.getDate()).padStart(2, '0')
  return `${y}-${mo}-${dy}`
}

function formatPeriodLabel(isoDate) {
  const d = new Date(isoDate + 'T12:00:00')
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

function getISOWeek(isoDate) {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

export default function DelayTrendChart({ trains }) {
  if (!trains || trains.length === 0) return null

  const byPeriod = {}

  trains.forEach((train) => {
    const period = getPeriodStart(train.advertisedTimeAtLocation)
    if (!byPeriod[period]) byPeriod[period] = { total: 0, delayed: 0, canceled: 0, count: 0 }
    byPeriod[period].count += 1
    if (train.canceled === true) {
      byPeriod[period].canceled += 1
    } else if (train.delayMinutes != null && train.delayMinutes > 0) {
      byPeriod[period].total += train.delayMinutes
      byPeriod[period].delayed += 1
    }
  })

  const data = Object.entries(byPeriod)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, val]) => ({
      vecka: formatPeriodLabel(period),
      weekNum: getISOWeek(period),
      snittFörsening: val.delayed > 0 ? Math.round(val.total / val.delayed) : 0,
      försenadeProcent: val.count > 0 ? Math.round((val.delayed / val.count) * 100) : 0,
      inställdaProcent: val.count > 0 ? Math.round((val.canceled / val.count) * 100) : 0,
      antalTåg: val.count,
    }))

  const weekStarts = []
  let lastWeek = null
  data.forEach((d) => {
    if (d.weekNum !== lastWeek) {
      weekStarts.push({ x: d.vecka, week: d.weekNum })
      lastWeek = d.weekNum
    }
  })

  if (data.length < 2) {
    return (
      <div style={styles.container}>
        <h2>Trend per vecka</h2>
        <div style={styles.empty}>Behöver data från minst 2 perioder</div>
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
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null
              const d = data.find((x) => x.vecka === label)
              if (!d) return null
              const försenade = Math.round((d.försenadeProcent / 100) * d.antalTåg)
              const inställda = Math.round((d.inställdaProcent / 100) * d.antalTåg)
              return (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: '700', marginBottom: '0.3rem' }}>{label}</div>
                  <div style={{ color: '#6b7280' }}>Totalt: {d.antalTåg} tåg</div>
                  <div style={{ color: '#1a5c38' }}>Försenade: {d.försenadeProcent}% ({försenade} tåg)</div>
                  <div style={{ color: '#dc2626' }}>Inställda: {d.inställdaProcent}% ({inställda} tåg)</div>
                </div>
              )
            }}
          />
          <Legend />
          {weekStarts.map((ws) => (
            <ReferenceLine
              key={ws.week}
              x={ws.x}
              stroke="#e5e7eb"
              strokeWidth={1}
              label={{ value: `v.${ws.week}`, position: 'insideTopLeft', fontSize: 10, fill: '#c1c8d0' }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="försenadeProcent"
            name="Försenade %"
            stroke="#1a5c38"
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
    marginBottom: '0',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#bbb',
    fontSize: '0.9rem',
  },
}
