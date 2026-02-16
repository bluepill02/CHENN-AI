import * as cheerio from "cheerio";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch("https://commuters-data.chennaimetrorail.org/parkingavailability");
    const html = await response.text();
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

    res.status(200).json(rows);
  } catch (err) {
    res.status(503).json({ error: "CMRL data unavailable" });
  }
}
