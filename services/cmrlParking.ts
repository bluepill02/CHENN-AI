// services/cmrlParking.ts
import * as cheerio from "cheerio";

export async function fetchCMRLParking() {
  const res = await fetch("https://commuters-data.chennaimetrorail.org/parkingavailability");
  const html = await res.text();
  const $ = cheerio.load(html);

  const rows: any[] = [];
  $("table tbody tr").each((_, el) => {
    const cols = $(el).find("td").map((_, td) => $(td).text().trim()).get();
    if (cols.length >= 4) {
      rows.push({
        station: cols[0],
        capacity: cols[1],
        occupied: cols[2],
        available: cols[3],
      });
    }
  });
  return rows;
}
