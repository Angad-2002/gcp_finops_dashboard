"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts"
import { useEffect, useState } from "react"
import { apiClient, type DashboardSummary, type ServiceCost, type CostTrendItem } from "@/lib/api-client"
import { fmtCurrency } from "@/lib/sample-data"

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [services, setServices] = useState<ServiceCost[]>([])
  const [cost6m, setCost6m] = useState<CostTrendItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [summaryRes, servicesRes, trendRes] = await Promise.all([
        apiClient.getSummary(),
        apiClient.getServiceCosts(),
        apiClient.getCostTrend(),
      ])

      if (summaryRes.error) {
        setError(summaryRes.error)
        return
      }
      if (servicesRes.error) {
        setError(servicesRes.error)
        return
      }
      if (trendRes.error) {
        setError(trendRes.error)
        return
      }

      setSummary(summaryRes.data!)
      setServices(servicesRes.data!)
      setCost6m(trendRes.data!)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await apiClient.refreshData()
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh data")
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={loadData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const isUp = summary.change_pct >= 0
  const chartColors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ]

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{summary.project_id}</h1>
          <p className="text-sm text-muted-foreground">{summary.billing_month}</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} size="sm" variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Month Spend</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-semibold">{fmtCurrency(summary.current_month)}</div>
            <Badge variant={isUp ? "default" : "destructive"} aria-label="Monthly change">
              {isUp ? (
                <span className="inline-flex items-center">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  {summary.change_pct.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                  {Math.abs(summary.change_pct).toFixed(1)}%
                </span>
              )}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Month Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{fmtCurrency(summary.last_month)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{fmtCurrency(summary.potential_savings)}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly optimization potential</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Resources</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-semibold">{summary.resources_active}</div>
            <Button size="sm" variant="outline" asChild>
              <a href="/resources" aria-label="Go to resources">
                View
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Cost by service + Trend */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Cost by Service</CardTitle>
            <Button size="sm" variant="outline" asChild>
              <a href="/cost-analysis">View All</a>
            </Button>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={services} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {services.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, n: string) => [fmtCurrency(val), n]}
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-sm font-medium">6-Month Cost Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cost6m} margin={{ left: 8, right: 8 }}>
                <defs>
                  <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(val: number, n: string) => [n === "cost" ? fmtCurrency(val) : `${val}%`, n]}
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)" }}
                />
                <Area type="monotone" dataKey="cost" stroke="var(--color-chart-1)" fill="url(#costFill)" />
                <Line type="monotone" dataKey="change" yAxisId={1} stroke="var(--color-chart-3)" dot={false} />
                <YAxis yAxisId={1} orientation="right" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Quick Info */}
      <section className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Year-to-Date Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{fmtCurrency(summary.ytd)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total spend for the year</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
