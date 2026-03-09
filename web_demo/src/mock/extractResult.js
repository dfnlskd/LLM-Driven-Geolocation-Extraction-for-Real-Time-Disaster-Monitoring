/**
 * Mock extraction results — derived from Examples.txt (8 real examples).
 * Each entry contains the source text, extracted JSON, and highlight spans.
 *
 * module mapping:
 *   'event'  → Event fields        (blue)
 *   'geo'    → Geographical Info   (green)
 *   'impact' → Effect fields       (orange)
 */

// Helper: build spans by searching for keyword occurrences in text
function spans(text, entries) {
  return entries.flatMap(({ keywords, field, module }) =>
    keywords
      .map((kw) => {
        const start = text.indexOf(kw)
        return start >= 0 ? { start, end: start + kw.length, field, module } : null
      })
      .filter(Boolean)
  )
}

export const EXAMPLES = [
  {
    id: 1,
    label: 'Flood — Bangladesh',
    date: '2025-05',
    group: 'Hydrological',
    type: 'Flood',
    country: 'Bangladesh',
    text: `The ongoing flood crisis in Bangladesh began in mid-May 2025, primarily triggered by heavy monsoon rainfall and upstream water flow from India. As of 1 June 2025, several districts, including Sylhet, Sunamganj, Moulvibazar, Habiganj, Netrokona, Noakhali, Bhola, Khagrachari, Bandarban and Rangamati have been severely affected. (Bangladesh Red Crescent Society, 2 Jun 2025)`,
    extractedJson: {
      Event: {
        'Disaster Group': 'Hydrological',
        'Disaster Type': 'Flood',
        'Disaster Date (YMD)': '2025-05',
        Cause: 'Heavy monsoon rainfall and upstream water flow from India',
      },
      'Geographical Information': {
        Country: 'Bangladesh',
        'Geographical Level 1': ['Sylhet', 'Sunamganj', 'Moulvibazar', 'Habiganj', 'Netrokona', 'Noakhali', 'Bhola', 'Khagrachari', 'Bandarban', 'Rangamati'],
      },
      Effect: {},
    },
    get spans() { return spans(this.text, [
      { keywords: ['Bangladesh'], field: 'Country', module: 'geo' },
      { keywords: ['Sylhet', 'Sunamganj', 'Moulvibazar', 'Habiganj', 'Netrokona', 'Noakhali', 'Bhola', 'Khagrachari', 'Bandarban', 'Rangamati'], field: 'Geographical Level 1', module: 'geo' },
      { keywords: ['mid-May 2025', '1 June 2025'], field: 'Disaster Date (YMD)', module: 'event' },
      { keywords: ['heavy monsoon rainfall and upstream water flow from India'], field: 'Cause', module: 'event' },
    ]) },
  },
  {
    id: 2,
    label: 'Epidemic — Ecuador',
    date: '2025-04-30',
    group: 'Biological',
    type: 'Epidemic',
    country: 'Ecuador',
    text: `As of 30 April, three cases were reported in Ecuador. Predicting new cases is uncertain due to virus transmission dynamics and irregular border crossings, especially from Colombia and Peru, where outbreaks persist. Risk is higher in Amazonian provinces with 88% vaccination—below the 95% target recommended by the Ministry of Public Health. Low coverage has led to rapid spread before. Strengthening surveillance, vector control, and immunization is key to protecting vulnerable populations. (IFRC, 15 May 2025)`,
    extractedJson: {
      Event: {
        'Disaster Group': 'Biological',
        'Disaster Type': 'Epidemic',
        'Disaster Date (YMD)': '2025-04-30',
        Cause: 'Virus transmission dynamics and irregular border crossings',
      },
      'Geographical Information': {
        Country: 'Ecuador',
        'Geographical Level 0': ['Amazonian provinces'],
      },
      Effect: {
        'Number of Injured': 3,
      },
    },
    get spans() { return spans(this.text, [
      { keywords: ['Ecuador'], field: 'Country', module: 'geo' },
      { keywords: ['Amazonian provinces'], field: 'Geographical Level 0', module: 'geo' },
      { keywords: ['30 April'], field: 'Disaster Date (YMD)', module: 'event' },
      { keywords: ['virus transmission dynamics and irregular border crossings'], field: 'Cause', module: 'event' },
      { keywords: ['three cases'], field: 'Number of Injured', module: 'impact' },
    ]) },
  },
  {
    id: 3,
    label: 'Drought — Papua New Guinea',
    date: '2024-11',
    group: 'Climatological',
    type: 'Drought',
    country: 'Papua New Guinea',
    text: `The communities in Nissan, Fead, Carterets, Mortlock and Tasman islands in North Bougainville district of the Autonomous Region of Bougainville (AROB) are experiencing drought conditions since November 2024. The persistence of the dry spell prompted the Autonomous Bougainville Government's (ABG) Regional Disaster Centre (BRDC) to conduct a remote disaster needs assessment. According to the BRDC's assessment report dated 26 February 2025, the now 5-month long drought has resulted in the depletion of the communities' water supplies typically stored in rain-fed water tanks. The affected populations, totalling 10,948 persons or 2,248 families or households have begun to resort to sourcing drinking water from dug-out wells and coconuts, and using sea water for cooking. (UNCT PNG, 29 Mar 2025)`,
    extractedJson: {
      Event: {
        'Disaster Group': 'Climatological',
        'Disaster Type': 'Drought',
        'Disaster Date (YMD)': '2024-11',
      },
      'Geographical Information': {
        Country: 'Papua New Guinea',
        'Geographical Level 0': 'Autonomous Region of Bougainville (AROB)',
        'Geographical Level 1': 'North Bougainville District',
        'Geographical Level 2': ['Nissan Islands', 'Fead Islands', 'Carteret Islands', 'Mortlock Islands', 'Tasman Islands'],
      },
      Effect: {
        'Number of affected': 10948,
      },
    },
    get spans() { return spans(this.text, [
      { keywords: ['Papua New Guinea', 'PNG'], field: 'Country', module: 'geo' },
      { keywords: ['Autonomous Region of Bougainville (AROB)'], field: 'Geographical Level 0', module: 'geo' },
      { keywords: ['North Bougainville district'], field: 'Geographical Level 1', module: 'geo' },
      { keywords: ['Nissan', 'Fead', 'Carterets', 'Mortlock', 'Tasman'], field: 'Geographical Level 2', module: 'geo' },
      { keywords: ['November 2024'], field: 'Disaster Date (YMD)', module: 'event' },
      { keywords: ['10,948 persons'], field: 'Number of affected', module: 'impact' },
    ]) },
  },
  {
    id: 4,
    label: 'Storm — Georgia',
    date: '2025-02-21',
    group: 'Meteorological',
    type: 'Storm',
    country: 'Georgia',
    text: `Since 21 February 2025, Western Georgia has been struggling with a severe winter storm, causing widespread damage and humanitarian challenges. The most critical impact was recorded on 1 March and the disaster is still ongoing, with heavy snow and extreme weather conditions continuing to affect Guria, Adjara, Imereti, and Mtskheta-Mtianeti. Many villages remain isolated, thousands of people are still without electricity, and emergency responders are facing serious challenges in reaching those in need.`,
    extractedJson: {
      Event: {
        'Disaster Group': 'Meteorological',
        'Disaster Type': 'Storm',
        'Disaster Date (YMD)': '2025-02-21',
      },
      'Geographical Information': {
        Country: 'Georgia',
        'Geographical Level 0': ['Guria', 'Adjara', 'Imereti', 'Mtskheta-Mtianeti'],
      },
      Effect: {},
    },
    get spans() { return spans(this.text, [
      { keywords: ['Georgia', 'Western Georgia'], field: 'Country', module: 'geo' },
      { keywords: ['Guria', 'Adjara', 'Imereti', 'Mtskheta-Mtianeti'], field: 'Geographical Level 0', module: 'geo' },
      { keywords: ['21 February 2025'], field: 'Disaster Date (YMD)', module: 'event' },
    ]) },
  },
  {
    id: 5,
    label: 'Volcanic activity — Philippines',
    date: '2023-06-08',
    group: 'Geophysical',
    type: 'Volcanic activity',
    country: 'Philippines',
    text: `Issued on 08 June 2023, the alert level for Mayon Volcano was raised from Alert Level 2 to Alert Level 3, which indicates that there is an increased tendency towards a hazardous eruption. (Govt. of the Philippines, 8 Jun 2023). As of 10 June, a total of 8,294 families or 33,691 persons are affected in 27 barangays in Albay. Alert Level 3 prevails over Mayon Volcano, which means that it is currently in a relatively high level of unrest as magma is at the crater and hazardous eruption is possible within weeks or even days. (Govt. of the Philippines, 10 Jun 2023)`,
    extractedJson: {
      Event: {
        'Disaster Group': 'Geophysical',
        'Disaster Type': 'Volcanic activity',
        'Disaster Date (YMD)': '2023-06-08',
      },
      'Geographical Information': {
        Country: 'Philippines',
        'Geographical Level 0': 'Albay',
      },
      Effect: {
        'Number of affected': 33691,
      },
    },
    get spans() { return spans(this.text, [
      { keywords: ['Philippines'], field: 'Country', module: 'geo' },
      { keywords: ['Albay'], field: 'Geographical Level 0', module: 'geo' },
      { keywords: ['08 June 2023'], field: 'Disaster Date (YMD)', module: 'event' },
      { keywords: ['33,691 persons'], field: 'Number of affected', module: 'impact' },
    ]) },
  },
  {
    id: 6,
    label: 'Oil spill — Ecuador',
    date: '2025-03-13',
    group: 'Industrial accident',
    type: 'Oil spill',
    country: 'Ecuador',
    text: `On 13 March, a major oil pipeline ruptured inland Ecuador, contaminating several rivers and outpouring into coastal areas. More than 300,000 people are affected, primarily due to the suspension of potable water in the area. The lack of safe access to water increases the risk of disease and heightens vulnerabilities and needs in affected communities that are already highly marginalized. On 20 March, the Government officially requested support from the United Nations. The situation is further exacerbated by ongoing security challenges in Esmeraldas, one of the provinces most affected by the national security crisis, while heavy rains continue to hinder response efforts. (OCHA, 20 Mar 2025)`,
    extractedJson: {
      Event: {
        'Disaster Group': 'Industrial accident',
        'Disaster Type': 'Oil spill',
        'Disaster Date (YMD)': '2025-03-13',
        Cause: 'Major oil pipeline rupture',
      },
      'Geographical Information': {
        Country: 'Ecuador',
        'Geographical Level 0': 'Esmeraldas',
      },
      Effect: {
        'Number of affected': 300000,
      },
    },
    get spans() { return spans(this.text, [
      { keywords: ['Ecuador'], field: 'Country', module: 'geo' },
      { keywords: ['Esmeraldas'], field: 'Geographical Level 0', module: 'geo' },
      { keywords: ['13 March'], field: 'Disaster Date (YMD)', module: 'event' },
      { keywords: ['major oil pipeline ruptured'], field: 'Cause', module: 'event' },
      { keywords: ['300,000 people'], field: 'Number of affected', module: 'impact' },
    ]) },
  },
  {
    id: 7,
    label: 'Fire — Guinea-Bissau',
    date: '2023-01-14',
    group: 'Miscellaneous accident',
    type: 'Fire (Miscellaneous)',
    country: 'Guinea-Bissau',
    text: `In the morning hours of January 14, 2023, a fire broke out in Menegue Village close to Canhabaque that destroyed dozens houses and along with food stock, crops and seeds. According to findings from a rapid assessment of Guinea Bissau Red Cross on 19th January, the fire incident has affected 295 Households (2065 people). (IFRC, 1 Feb 2023)`,
    extractedJson: {
      Event: {
        'Disaster Group': 'Miscellaneous accident',
        'Disaster Type': 'Fire (Miscellaneous)',
        'Disaster Date (YMD)': '2023-01-14',
      },
      'Geographical Information': {
        Country: 'Guinea-Bissau',
        Location: 'Menegue Village',
      },
      Effect: {
        'Number of affected': 2065,
      },
    },
    get spans() { return spans(this.text, [
      { keywords: ['Guinea Bissau'], field: 'Country', module: 'geo' },
      { keywords: ['Menegue Village'], field: 'Location', module: 'geo' },
      { keywords: ['January 14, 2023'], field: 'Disaster Date (YMD)', module: 'event' },
      { keywords: ['2065 people'], field: 'Number of affected', module: 'impact' },
    ]) },
  },
  {
    id: 8,
    label: 'Ferry sinking — Philippines',
    date: '2008-06-21',
    group: 'Transport',
    type: 'Water',
    country: 'Philippines',
    text: `The 'Princess of the Stars' ferry, which left Manila on Friday 20 June, went aground on Saturday 21 June. About 16 hours into the 22-hour voyage the ferry began to sink as Typhoon Fengshen moved through the area. The vessel capsized about 3 kilometres from Romblon on the shore of Sibuyan Island in the central Philippines. More than 700 passengers lost their lives. It was reported that the boat was transporting an estimated amount of 100,000 litres of fuel. (OCHA, 15 Jul 2008)`,
    extractedJson: {
      Event: {
        'Disaster Group': 'Transport',
        'Disaster Type': 'Water',
        'Disaster Date (YMD)': '2008-06-21',
        Cause: 'Ferry capsized during Typhoon Fengshen',
      },
      'Geographical Information': {
        Country: 'Philippines',
      },
      Effect: {
        'Total Deaths': 700,
      },
    },
    get spans() { return spans(this.text, [
      { keywords: ['Philippines'], field: 'Country', module: 'geo' },
      { keywords: ['21 June'], field: 'Disaster Date (YMD)', module: 'event' },
      { keywords: ['Typhoon Fengshen'], field: 'Cause', module: 'event' },
      { keywords: ['700 passengers'], field: 'Total Deaths', module: 'impact' },
    ]) },
  },
]

/**
 * Given input text, find the best matching example and return its result.
 * Tries exact text match first, then country+type together, then country alone.
 * Falls back to Example 1 (Bangladesh flood) if no match found.
 */
export function mockExtractResult(text) {
  const trimmed = text.trim()
  const match =
    EXAMPLES.find((e) => e.text.trim() === trimmed) ??
    EXAMPLES.find((e) => text.includes(e.country) && text.includes(e.type)) ??
    EXAMPLES.find((e) => text.includes(e.country)) ??
    EXAMPLES[0]

  return {
    extractedJson: match.extractedJson,
    spans: match.spans,
  }
}