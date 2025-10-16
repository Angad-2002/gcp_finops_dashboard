"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download, Trash2, FileText, Loader2, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient, type Report } from "@/lib/api-client"

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReports = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.getReports()
      if (response.error) {
        setError(response.error)
        return
      }
      setReports(response.data?.reports || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      const response = await apiClient.generateReport()
      if (response.error) {
        setError(response.error)
        return
      }
      
      // Reload reports list
      await loadReports()
      
      // Show success message
      if (response.data) {
        alert(`✅ Report generated successfully!\n\nFilename: ${response.data.filename}\nSize: ${response.data.size}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteReport = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return
    }

    try {
      const response = await apiClient.deleteReport(filename)
      if (response.error) {
        setError(response.error)
        return
      }
      
      // Reload reports list
      await loadReports()
      alert("✅ Report deleted successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete report")
    }
  }

  const handleDownload = (filename: string) => {
    const url = apiClient.getReportDownloadUrl(filename)
    window.open(url, "_blank")
  }

  useEffect(() => {
    loadReports()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={loadReports} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate and download PDF reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadReports} size="sm" variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleGenerateReport} size="sm" disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Generate your first report to see cost analysis and optimization recommendations.
            </p>
            <Button onClick={handleGenerateReport} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Generated Reports ({reports.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reports.map((report) => {
                const date = new Date(report.created_at)
                const formattedDate = date.toLocaleString()
                
                return (
                  <div
                    key={report.filename}
                    className="flex items-center justify-between rounded-md border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-medium text-sm">{report.filename}</div>
                        <div className="text-xs text-muted-foreground">
                          {formattedDate} • {report.size}
                          {report.project_id && ` • ${report.project_id}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(report.filename)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReport(report.filename)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">About Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Reports include:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Cost summary and trends</li>
                <li>Service-level breakdown</li>
                <li>Resource audit results</li>
                <li>Optimization recommendations</li>
                <li>Potential savings analysis</li>
              </ul>
              <p className="mt-4">
                Reports are generated as PDF files and stored locally. You can download or delete them at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
