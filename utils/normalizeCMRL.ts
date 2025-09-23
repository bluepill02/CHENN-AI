export function normalizeParking(rows: any[]) {
  return rows.map(r => ({
    type: "parking",
    category: "metro",
    location: { station: r.station },
    message: {
      en: `${r.available} slots free at ${r.station} Metro`,
      ta: `${r.station} நிலையத்தில் ${r.available} இடங்கள் காலியாக உள்ளன`
    },
    timestamp: new Date().toISOString(),
    source: { provider: "CMRL Parking Portal" }
  }));
}
