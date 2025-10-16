"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient, type ResourcesSummary, type AuditResult } from "@/lib/api-client"

export default function ResourcesPage() {
  const [summary, setSummary] = useState<ResourcesSummary | null>(null)
  const [audits, setAudits] = useState<Record<string, AuditResult> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [summaryRes, auditsRes] = await Promise.all([
        apiClient.getResourcesSummary(),
        apiClient.getAudits(),
      ])

      if (summaryRes.error) {
        setError(summaryRes.error)
        return
      }
      if (auditsRes.error) {
        setError(auditsRes.error)
        return
      }

      setSummary(summaryRes.data!)
      setAudits(auditsRes.data!)
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
          <p className="mt-2 text-muted-foreground">Loading resources...</p>
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

  if (!summary || !audits) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-sm text-muted-foreground">Overview of all GCP resources</p>
        </div>
        <Button onClick={loadData} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">{summary.running}</div>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Idle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">{summary.idle}</div>
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Untagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold">{summary.untagged}</div>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Audit results by resource type */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Audit Results by Resource Type</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(audits).map(([key, audit]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-base">
                  {audit.resource_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Resources:</span>
                  <span className="font-medium">{audit.total_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Untagged:</span>
                  <Badge variant={audit.untagged_count > 0 ? "destructive" : "secondary"}>
                    {audit.untagged_count}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Idle:</span>
                  <Badge variant={audit.idle_count > 0 ? "destructive" : "secondary"}>
                    {audit.idle_count}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Over-provisioned:</span>
                  <Badge variant={audit.over_provisioned_count > 0 ? "destructive" : "secondary"}>
                    {audit.over_provisioned_count}
                  </Badge>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Potential Savings:</span>
                    <span className="text-green-600">
                      ${audit.potential_monthly_savings.toFixed(2)}/mo
                    </span>
                  </div>
                </div>
                {audit.issues.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Issues:</p>
                    <ul className="space-y-1">
                      {audit.issues.slice(0, 3).map((issue, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start">
                          <span className="mr-1">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                      {audit.issues.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{audit.issues.length - 3} more issues
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
