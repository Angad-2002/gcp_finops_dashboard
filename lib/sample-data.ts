export const summary = {
  currentMonth: 48231.42,
  lastMonth: 45510.13,
  budgetUsedPct: 72,
  resourcesActive: 1234,
  changePct: ((48231.42 - 45510.13) / 45510.13) * 100,
}

export const services = [
  { name: "Compute Engine", value: 18540 },
  { name: "Cloud Storage", value: 9200 },
  { name: "BigQuery", value: 7600 },
  { name: "Cloud Run", value: 5200 },
  { name: "Cloud SQL", value: 3691 },
]

export const cost6m = [
  { month: "May", cost: 38800, change: 0 },
  { month: "Jun", cost: 40120, change: 3.4 },
  { month: "Jul", cost: 42610, change: 6.2 },
  { month: "Aug", cost: 43950, change: 3.1 },
  { month: "Sep", cost: 45510, change: 3.5 },
  { month: "Oct", cost: 48231, change: 6.0 },
]

export const alerts = [
  { id: 1, severity: "high", text: "Budget for 'Prod Core' at 92% of limit." },
  { id: 2, severity: "medium", text: "Detected cost spike in BigQuery last 48h." },
  { id: 3, severity: "low", text: "12 untagged resources need labels." },
]

export const byServiceRows = [
  { name: "Compute Engine", current: 18540, prev: 17200 },
  { name: "Cloud Storage", current: 9200, prev: 8800 },
  { name: "BigQuery", current: 7600, prev: 7000 },
  { name: "Cloud Run", current: 5200, prev: 5100 },
  { name: "Cloud SQL", current: 3691, prev: 3410 },
]

export const budgets = [
  { name: "Prod Core", limit: 60000, spend: 48231, forecast: 62500 },
  { name: "Data Lake", limit: 30000, spend: 19800, forecast: 28900 },
  { name: "ML Lab", limit: 25000, spend: 16220, forecast: 23800 },
  { name: "Shared VPC", limit: 12000, spend: 8900, forecast: 11900 },
]

export const resourcesSummary = {
  total: 2130,
  running: 1540,
  idle: 360,
  untagged: 230,
}

export const recentReports = [
  { name: "Monthly Cost Summary - Sep", date: "2025-10-01", size: "268 KB" },
  { name: "Budget Performance - Q3", date: "2025-09-30", size: "312 KB" },
  { name: "Resource Audit - Oct", date: "2025-10-10", size: "154 KB" },
]

export function fmtCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n)
}
