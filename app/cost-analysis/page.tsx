"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { useEffect, useState } from "react"
import { apiClient, type ServiceCost, type DashboardSummary } from "@/lib/api-client"
import { fmtCurrency } from "@/lib/sample-data"

export default function CostAnalysisPage() {
  const [services, setServices] = useState<ServiceCost[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [servicesRes, summaryRes] = await Promise.all([
        apiClient.getServiceCosts(),
        apiClient.getSummary(),
      ])

      if (servicesRes.error) {
        setError(servicesRes.error)
        return
      }
      if (summaryRes.error) {
        setError(summaryRes.error)
        return
      }

      setServices(servicesRes.data!)
      setSummary(summaryRes.data!)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
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
          <p className="mt-2 text-muted-foreground">Loading cost analysis...</p>
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

  if (!services.length || !summary) {
    return null
  }

  const isUp = summary.change_pct >= 0
  const totalCost = services.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cost Analysis</h1>
          <p className="text-sm text-muted-foreground">Breakdown of costs by service</p>
        </div>
        <Button onClick={loadData} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{fmtCurrency(summary.current_month)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Month-over-Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">
                {isUp ? "+" : ""}
                {summary.change_pct.toFixed(1)}%
              </div>
              {isUp ? (
                <TrendingUp className="h-6 w-6 text-red-500" />
              ) : (
                <TrendingDown className="h-6 w-6 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">YTD Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{fmtCurrency(summary.ytd)}</div>
          </CardContent>
        </Card>
      </section>

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost by Service</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={services} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={120}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [fmtCurrency(value), "Cost"]}
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)" }}
              />
              <Legend />
              <Bar dataKey="value" fill="var(--color-chart-1)" name="Monthly Cost" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service, i) => {
              const percentage = (service.value / totalCost) * 100
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-muted-foreground">
                      {fmtCurrency(service.value)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
