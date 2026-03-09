import * as d3 from 'd3'

/**
 * Load and normalize disaster events from the real CSV.
 * CSV columns use dot-notation: "Event.Disaster Group", "Effect.Number of Deaths", etc.
 * Returns a flat array of event objects for dashboard consumption.
 */
export async function mockEvents() {
  const raw = await d3.csv('/data/events_std_clean.csv')

  return raw.map((r, i) => {
    const dateStr = r['Event.Disaster Date (YMD)'] || ''
    const year = dateStr ? parseInt(dateStr.slice(0, 4)) : null

    return {
      id: i + 1,
      year,
      date: dateStr,
      country: r['Country'] || r['Geographical Information.Country'] || '',
      iso3: r['ISO3'] || '',
      group: r['Event.Disaster Group'] || '',
      type: r['Event.Disaster Type'] || '',
      cause: r['Event.Cause'] || '',
      magnitude: parseFloat(r['Event.Magnitude']) || null,
      magnitudeScale: r['Event.Magnitude Scale'] || '',
      level0: r['Geographical Information.Geographical Level 0'] || '',
      level1: r['Geographical Information.Geographical Level 1'] || '',
      level2: r['Geographical Information.Geographical Level 2'] || '',
      location: r['Geographical Information.Location'] || '',
      deaths: parseFloat(r['Effect.Number of Deaths']) || 0,
      missing: parseFloat(r['Effect.Number of missing [Missing persons]']) || 0,
      injured: parseFloat(r['Effect.Number of Injured']) || 0,
      affected: parseFloat(r['Effect.Number of affected']) || 0,
      damaged: parseFloat(r['Effect.Number of damaged and destroyed dwellings ']) || 0,
    }
  }).filter(e => e.year && e.country)
}