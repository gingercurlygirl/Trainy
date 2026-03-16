// Populated at runtime from /train_announcements/stations
const stationMap = {}

export function populateStationMap(stations) {
  stations.forEach(s => {
    stationMap[s.code] = s.name
  })
}

export function getStationName(code) {
  return stationMap[code] ?? code
}
