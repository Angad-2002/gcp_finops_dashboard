"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts"
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertCircle, Sparkles } from "lucide-react"
import { apiClient, type CostTrendItem, type ForecastData, type ForecastSummary } from "@/lib/api-client"

export default function TrendsPage() {
  const [trendData, setTrendData] = useState<CostTrendItem[]>([])
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [forecastSummary, setForecastSummary] = useState<ForecastSummary | null>(null)
  const [showForecast, setShowForecast] = useState(true)
  const [loading, setLoading] = useState(true)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [trendRes, summaryRes] = await Promise.all([
        apiClient.getCostTrend(),
        apiClient.getForecastSummary(30)
      ])
      
      if (trendRes.error) {
        setError(trendRes.error)
        return
      }
      setTrendData(trendRes.data || [])
      
      // Load forecast summary (non-blocking)
      if (summaryRes.data) {
        setForecastSummary(summaryRes.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trend data")
    } finally {
      setLoading(false)
    }
  }

  const loadForecast = async () => {
    setForecastLoading(true)
    try {
      const response = await apiClient.getCostForecast({ days: 90, historical_days: 180 })
      if (response.data) {
        setForecastData(response.data)
      }
    } catch (err) {
      console.error("Failed to load forecast:", err)
    } finally {
      setForecastLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (showForecast && !forecastData) {
      loadForecast()
    }
  }, [showForecast])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading trend data...</p>
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

  const getTrendIcon = (trend?: string) => {
    if (trend === "increasing") return <TrendingUp className="h-4 w-4" />
    if (trend === "decreasing") return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = (trend?: string) => {
    if (trend === "increasing") return "destructive"
    if (trend === "decreasing") return "default"
    return "secondary"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cost Trends & Forecast</h1>
          <p className="text-sm text-muted-foreground">Historical data and AI-powered predictions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadData} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Forecast Summary Cards */}
      {forecastSummary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Predicted (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                ${forecastSummary.predicted_cost_next_30d.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Next 30 days forecast</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                ${forecastSummary.current_month_cost.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Actual spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Trend</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Badge variant={getTrendColor(forecastSummary.trend)} className="flex items-center gap-1">
                {getTrendIcon(forecastSummary.trend)}
                {forecastSummary.trend}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {(() => {
                  const diff = forecastSummary.predicted_cost_next_30d - forecastSummary.current_month_cost
                  const pct = (diff / forecastSummary.current_month_cost) * 100
                  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {(forecastSummary.confidence * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Model accuracy</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Cost Forecast</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Historical data + 90-day predictions</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-forecast" className="text-sm cursor-pointer">Show Forecast</Label>
            <Switch 
              id="show-forecast"
              checked={showForecast} 
              onCheckedChange={setShowForecast}
            />
          </div>
        </CardHeader>
        <CardContent className="h-[400px]">
          {trendData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No trend data available. Cost data will appear once billing export is enabled and populated.
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {showForecast && forecastData ? (
                <AreaChart data={[...trendData.map((t, i) => ({ 
                  date: t.month, 
                  actual: t.cost,
                  index: i 
                })), ...forecastData.forecast_points.map((f, i) => ({
                  date: f.date.substring(5), // MM-DD format
                  predicted: f.predicted_cost,
                  lower: f.lower_bound,
                  upper: f.upper_bound,
                  index: trendData.length + i
                }))]}>
                  <defs>
                    <linearGradient id="confidenceArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        actual: "Actual",
                        predicted: "Predicted",
                        lower: "Lower Bound",
                        upper: "Upper Bound"
                      }
                      return [`$${value.toFixed(2)}`, labels[name] || name]
                    }}
                    contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)" }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    stroke="transparent"
                    fill="url(#confidenceArea)"
                    name="Upper Bound"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lower" 
                    stroke="transparent"
                    fill="url(#confidenceArea)"
                    name="Lower Bound"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="var(--color-chart-1)" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="var(--color-chart-2)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 2 }}
                    name="Predicted"
                  />
                  <Legend />
                </AreaChart>
              ) : (
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === "cost") {
                        return [`$${value.toFixed(2)}`, "Cost"]
                      }
                      return [`${value.toFixed(1)}%`, "Change"]
                    }}
                    contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)" }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="var(--color-chart-1)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Monthly Cost"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="change" 
                    stroke="var(--color-chart-3)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Change %"
                    yAxisId="right"
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Legend />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
          {forecastLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Historical Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Latest Month:</span>
                  <span className="font-semibold">
                    ${trendData[trendData.length - 1]?.cost.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Change:</span>
                  <span className="font-semibold">
                    {trendData[trendData.length - 1]?.change >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(trendData[trendData.length - 1]?.change || 0).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground border-t pt-2">
                  Monitor your spending trends to identify patterns and optimize costs over time.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Enable billing export to see cost trends and insights.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Forecast Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {forecastData ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">90-Day Total:</span>
                  <span className="font-semibold">
                    ${forecastData.total_predicted_cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trend:</span>
                  <Badge variant={getTrendColor(forecastData.trend)} className="flex items-center gap-1">
                    {getTrendIcon(forecastData.trend)}
                    {forecastData.trend}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-semibold">
                    {(forecastData.model_confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground border-t pt-2">
                  {forecastData.trend === "increasing" && "⚠️ Costs are predicted to increase. Consider optimization opportunities."}
                  {forecastData.trend === "decreasing" && "✅ Costs are predicted to decrease. Your optimizations are working!"}
                  {forecastData.trend === "stable" && "📊 Costs are predicted to remain stable."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {forecastLoading ? "Loading forecast..." : "Enable forecast to see predictions"}
                </p>
                {!forecastLoading && !showForecast && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowForecast(true)}
                    className="w-full"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Load Forecast
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
