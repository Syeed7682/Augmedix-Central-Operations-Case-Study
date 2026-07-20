/**
 * Real analysis data from the Augmedix PT Documentation Reconciliation study.
 * Source: SQL/augmedix.db — Jul–Sep 2024 dataset (6,482 sessions, 26,716 CPT lines)
 */

// ── Reconciliation Summary (Q2) ───────────────────────────────────────────────
export interface ReconSummary {
  status: string;
  records: number;
  pct: number;
}
export const RECON_SUMMARY: ReconSummary[] = [
  { status: 'Matched',  records: 25157, pct: 94.16 },
  { status: 'EHR_Only', records: 1357,  pct: 5.08  },
  { status: 'DB_Only',  records: 202,   pct: 0.76  },
];

// ── Provider Accuracy (Q3) ────────────────────────────────────────────────────
export interface ProviderStats {
  name: string;
  total: number;
  matched: number;
  dbOnly: number;
  ehrOnly: number;
  matchPct: number;
  dbOnlyPct: number;
  ehrOnlyPct: number;
  rag: 'GREEN' | 'YELLOW' | 'RED';
}
export const PROVIDERS: ProviderStats[] = [
  { name: 'Julian Lee',         total: 1750, matched: 1687, dbOnly: 11,  ehrOnly: 52,  matchPct: 96.4, dbOnlyPct: 0.6, ehrOnlyPct: 3.0, rag: 'GREEN'  },
  { name: 'Sebastian Martinez', total: 2078, matched: 1995, dbOnly: 6,   ehrOnly: 77,  matchPct: 96.0, dbOnlyPct: 0.3, ehrOnlyPct: 3.7, rag: 'GREEN'  },
  { name: 'Noah Lee',           total: 5965, matched: 5712, dbOnly: 35,  ehrOnly: 218, matchPct: 95.8, dbOnlyPct: 0.6, ehrOnlyPct: 3.7, rag: 'GREEN'  },
  { name: 'Elijah Johnson',     total: 1035, matched: 989,  dbOnly: 0,   ehrOnly: 46,  matchPct: 95.6, dbOnlyPct: 0.0, ehrOnlyPct: 4.4, rag: 'GREEN'  },
  { name: 'Charlotte Williams', total: 2402, matched: 2289, dbOnly: 1,   ehrOnly: 112, matchPct: 95.3, dbOnlyPct: 0.0, ehrOnlyPct: 4.7, rag: 'GREEN'  },
  { name: 'Aiden King',         total: 8322, matched: 7797, dbOnly: 45,  ehrOnly: 480, matchPct: 93.7, dbOnlyPct: 0.5, ehrOnlyPct: 5.8, rag: 'GREEN'  },
  { name: 'Sebastian Miller',   total: 2656, matched: 2434, dbOnly: 17,  ehrOnly: 205, matchPct: 91.6, dbOnlyPct: 0.6, ehrOnlyPct: 7.7, rag: 'GREEN'  },
  { name: 'Liam Young',         total: 2506, matched: 2254, dbOnly: 87,  ehrOnly: 165, matchPct: 89.9, dbOnlyPct: 3.5, ehrOnlyPct: 6.6, rag: 'YELLOW' },
];

// ── CPT Code Data (Q4 + Q9) ───────────────────────────────────────────────────
export interface CptStats {
  code: string;
  description: string;
  total: number;
  matched: number;
  dbOnly: number;
  ehrOnly: number;
  matchPct: number;
  dbCount: number;
  ehrCount: number;
}
export const CPT_CODES: CptStats[] = [
  { code: '97140', description: 'Manual Therapy',              total: 6598, matched: 6298, dbOnly: 42,  ehrOnly: 258, matchPct: 95.5, dbCount: 6143, ehrCount: 6370 },
  { code: '97110', description: 'Therapeutic Exercises',       total: 5807, matched: 5539, dbOnly: 43,  ehrOnly: 225, matchPct: 95.4, dbCount: 5448, ehrCount: 5640 },
  { code: '97112', description: 'Neuromuscular Re-education',  total: 5063, matched: 4836, dbOnly: 27,  ehrOnly: 200, matchPct: 95.5, dbCount: 4728, ehrCount: 4911 },
  { code: '97010', description: 'Hot/Cold Pack',               total: 4995, matched: 4781, dbOnly: 36,  ehrOnly: 178, matchPct: 95.7, dbCount: 4688, ehrCount: 4844 },
  { code: '97014', description: 'Elec. Stim (unattended)',     total: 1883, matched: 1751, dbOnly: 31,  ehrOnly: 101, matchPct: 93.0, dbCount: 1776, ehrCount: 1846 },
  { code: 'G0283', description: 'Elec. Stim (attended/CMS)',   total: 762,  matched: 740,  dbOnly: 3,   ehrOnly: 19,  matchPct: 97.1, dbCount: 739,  ehrCount: 759  },
  { code: '97161', description: 'PT Eval – Low Complexity',    total: 380,  matched: 370,  dbOnly: 2,   ehrOnly: 8,   matchPct: 97.4, dbCount: 372,  ehrCount: 378  },
  { code: '97162', description: 'PT Eval – Moderate',          total: 254,  matched: 240,  dbOnly: 4,   ehrOnly: 10,  matchPct: 94.5, dbCount: 244,  ehrCount: 250  },
  { code: '97035', description: 'Ultrasound Therapy',          total: 252,  matched: 218,  dbOnly: 11,  ehrOnly: 23,  matchPct: 86.5, dbCount: 227,  ehrCount: 239  },
  { code: '97530', description: 'Therapeutic Activities',      total: 126,  matched: 125,  dbOnly: 0,   ehrOnly: 1,   matchPct: 99.2, dbCount: 125,  ehrCount: 126  },
  { code: '97163', description: 'PT Eval – High Complexity',   total: 56,   matched: 55,   dbOnly: 0,   ehrOnly: 1,   matchPct: 98.2, dbCount: 55,   ehrCount: 56   },
];

// ── Monthly Trend (Q5) ────────────────────────────────────────────────────────
export interface MonthlyStats {
  month: string;
  label: string;
  sessions: number;
  cptLines: number;
  matched: number;
  dbOnly: number;
  ehrOnly: number;
  matchRate: number;
}
export const MONTHLY: MonthlyStats[] = [
  { month: '2024-07', label: 'July',      sessions: 2032, cptLines: 8718,  matched: 8351,  dbOnly: 67,  ehrOnly: 300, matchRate: 95.8 },
  { month: '2024-08', label: 'August',    sessions: 2132, cptLines: 9088,  matched: 8513,  dbOnly: 50,  ehrOnly: 525, matchRate: 93.7 },
  { month: '2024-09', label: 'September', sessions: 2094, cptLines: 8908,  matched: 8293,  dbOnly: 85,  ehrOnly: 530, matchRate: 93.1 },
];

// ── Duplicate CPT Sessions (Q8) ───────────────────────────────────────────────
export interface DuplicateSession {
  patient: string;
  provider: string;
  date: string;
  rawCpt: string;
  uniqueCount: number;
  rawCount: number;
  dupsRemoved: number;
}
export const DUPLICATE_SESSIONS: DuplicateSession[] = [
  { patient: 'Sophia Young',      provider: 'Noah Lee',           date: '2024-09-06', rawCpt: '{97112,97110,97140,97110,97010,97010,97112,97014,97140,97014}', uniqueCount: 5, rawCount: 10, dupsRemoved: 5 },
  { patient: 'Isabella Wilson',   provider: 'Aiden King',         date: '2024-08-06', rawCpt: '{97010,97112,97140,97140,97112,97010,97110,97110}',             uniqueCount: 4, rawCount: 8,  dupsRemoved: 4 },
  { patient: 'Charlotte Brown',   provider: 'Aiden King',         date: '2024-08-01', rawCpt: '{97112,97162,97112,97110,97140,97110,97162,97140}',             uniqueCount: 4, rawCount: 8,  dupsRemoved: 4 },
  { patient: 'Sebastian Perez',   provider: 'Noah Lee',           date: '2024-07-08', rawCpt: '{97110,97010,97140,97110,97112,97140,97112,97010}',             uniqueCount: 4, rawCount: 8,  dupsRemoved: 4 },
  { patient: 'Scarlett Smith',    provider: 'Aiden King',         date: '2024-09-12', rawCpt: '{97140,97140,97110,97110,97162,97162}',                         uniqueCount: 3, rawCount: 6,  dupsRemoved: 3 },
  { patient: 'Aria Allen',        provider: 'Noah Lee',           date: '2024-09-04', rawCpt: '{97162,97140,97140,97110,97162,97110}',                         uniqueCount: 3, rawCount: 6,  dupsRemoved: 3 },
  { patient: 'Layla Davis',       provider: 'Aiden King',         date: '2024-07-08', rawCpt: '{97112,97112,97010,97140,97010,97140}',                         uniqueCount: 3, rawCount: 6,  dupsRemoved: 3 },
  { patient: 'Isabella Moore',    provider: 'Liam Young',         date: '2024-08-07', rawCpt: '{97110,G0283,97010,97010,97112,97140,G0283}',                   uniqueCount: 5, rawCount: 7,  dupsRemoved: 2 },
  { patient: 'Mateo Johnson',     provider: 'Sebastian Miller',   date: '2024-09-16', rawCpt: '{97140,G0283,97112,97010,G0283,97161,97110}',                   uniqueCount: 6, rawCount: 7,  dupsRemoved: 1 },
  { patient: 'Emma Perez',        provider: 'Sebastian Martinez', date: '2024-09-05', rawCpt: '{G0283,97110,97140,97112,G0283}',                               uniqueCount: 4, rawCount: 5,  dupsRemoved: 1 },
  { patient: 'Emma Perez',        provider: 'Sebastian Martinez', date: '2024-09-11', rawCpt: '{97140,97110,G0283,G0283,97112}',                               uniqueCount: 4, rawCount: 5,  dupsRemoved: 1 },
  { patient: 'Isabella Moore',    provider: 'Liam Young',         date: '2024-08-05', rawCpt: '{97010,97112,97161,97110,97010}',                               uniqueCount: 4, rawCount: 5,  dupsRemoved: 1 },
  { patient: 'Layla Jackson',     provider: 'Sebastian Martinez', date: '2024-08-22', rawCpt: '{97010,97010,97140,97110,97112}',                               uniqueCount: 4, rawCount: 5,  dupsRemoved: 1 },
  { patient: 'Layla Martin',      provider: 'Liam Young',         date: '2024-07-16', rawCpt: '{97010,97140,97110,97010}',                                     uniqueCount: 3, rawCount: 4,  dupsRemoved: 1 },
  { patient: 'David Allen',       provider: 'Noah Lee',           date: '2024-08-29', rawCpt: '{97140,97112,97112,97140}',                                     uniqueCount: 2, rawCount: 4,  dupsRemoved: 2 },
];

// ── Global KPIs (derived) ─────────────────────────────────────────────────────
export const KPI = {
  totalSessions:   6482,
  totalCptLines:   26716,
  matchedLines:    25157,
  dbOnlyLines:     202,
  ehrOnlyLines:    1357,
  overallMatchPct: 94.16,
  activeProviders: 8,
  uniqueCptCodes:  11,
  duplicateSessions: 15,
  dataperiod:      'Jul – Sep 2024',
};
