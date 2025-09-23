// /services/mtcBus.ts
import * as cheerio from "cheerio";

export async function fetchMTCBusTimings(route: string, from: string, to: string) {
  const url = `https://mtcbus.tn.gov.in/Home/bustimingsearch?route=${route}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const timings: string[] = [];
  $("table tr td").each((_, el) => {
    const time = $(el).text().trim();
    if (/^[0-2]?[0-9]:[0-5][0-9]$/.test(time)) {
      timings.push(time);
    }
  });

  return {
    route,
    from,
    to,
    timings
  };
}
