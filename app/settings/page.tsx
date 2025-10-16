"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Save, RefreshCw, Sparkles, Info } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient, type ApiConfig, type HealthStatus, type AIModelsResponse, type AIStatus } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const [config, setConfig] = useState<ApiConfig>({
    project_id: "",
    billing_dataset: "",
    billing_table_prefix: "gcp_billing_export_v1",
    regions: [],
  })
  const [regionsInput, setRegionsInput] = useState("")
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  // AI Settings
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null)
  const [aiModels, setAiModels] = useState<AIModelsResponse | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [savingModel, setSavingModel] = useState(false)
  const [modelMessage, setModelMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadData = async () => {
    setLoading(true)

    try {
      const [configRes, healthRes, aiStatusRes, aiModelsRes] = await Promise.all([
        apiClient.getConfig(),
        apiClient.healthCheck(),
        apiClient.getAIStatus(),
        apiClient.getAIModels().catch(() => ({ data: null })), // Don't fail if AI not configured
      ])

      if (configRes.data) {
        setConfig(configRes.data)
        setRegionsInput(configRes.data.regions?.join(", ") || "")
      }
      if (healthRes.data) {
        setHealth(healthRes.data)
      }
      if (aiStatusRes.data) {
        setAiStatus(aiStatusRes.data)
      }
      if (aiModelsRes.data) {
        setAiModels(aiModelsRes.data)
        setSelectedModel(aiModelsRes.data.current_model)
      }
    } catch (err) {
      console.error("Failed to load settings:", err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleModelChange = async (modelId: string) => {
    setSavingModel(true)
    setModelMessage(null)
    
    try {
      const response = await apiClient.setAIModel(modelId)
      
      if (response.error) {
        setModelMessage({ type: "error", text: response.error })
      } else {
        setSelectedModel(modelId)
        setModelMessage({ 
          type: "success", 
          text: "AI model updated! Note: This is session-only. Set GROQ_MODEL env var to persist." 
        })
        
        // Reload AI status
        const statusRes = await apiClient.getAIStatus()
        if (statusRes.data) {
          setAiStatus(statusRes.data)
        }
      }
    } catch (err) {
      setModelMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update AI model",
      })
    } finally {
      setSavingModel(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const updatedConfig = {
        ...config,
        regions: regionsInput
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
      }

      const response = await apiClient.updateConfig(updatedConfig)

      if (response.error) {
        setMessage({ type: "error", text: response.error })
      } else {
        setMessage({ type: "success", text: "Configuration saved successfully!" })
        // Reload health status
        const healthRes = await apiClient.healthCheck()
        if (healthRes.data) {
          setHealth(healthRes.data)
        }
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save configuration",
      })
    } finally {
      setSaving(false)
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
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your GCP FinOps Dashboard</p>
      </div>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
          <CardDescription>Backend API connection status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection:</span>
            {health ? (
              <Badge variant={health.status === "healthy" ? "default" : "destructive"}>
                {health.status === "healthy" ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" />
                    Disconnected
                  </>
                )}
              </Badge>
            ) : (
              <Badge variant="secondary">Unknown</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Configuration:</span>
            {health ? (
              <Badge variant={health.configured ? "default" : "secondary"}>
                {health.configured ? "Configured" : "Not Configured"}
              </Badge>
            ) : (
              <Badge variant="secondary">Unknown</Badge>
            )}
          </div>
          {health?.timestamp && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Check:</span>
              <span className="text-sm text-muted-foreground">
                {new Date(health.timestamp).toLocaleString()}
              </span>
            </div>
          )}
          <Button onClick={loadData} size="sm" variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
        </CardContent>
      </Card>

      {/* GCP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>GCP Configuration</CardTitle>
          <CardDescription>Configure your GCP project and billing settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div
              className={`rounded-md border p-3 text-sm ${
                message.type === "success"
                  ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
                  : "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="project-id">Project ID</Label>
            <Input
              id="project-id"
              placeholder="my-gcp-project"
              value={config.project_id || ""}
              onChange={(e) => setConfig({ ...config, project_id: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Your GCP project ID (e.g., my-project-123456)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing-dataset">Billing Dataset</Label>
            <Input
              id="billing-dataset"
              placeholder="my-project.billing_export"
              value={config.billing_dataset || ""}
              onChange={(e) => setConfig({ ...config, billing_dataset: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              BigQuery billing dataset (e.g., my-project.billing_export)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing-table-prefix">Billing Table Prefix</Label>
            <Input
              id="billing-table-prefix"
              placeholder="gcp_billing_export_v1"
              value={config.billing_table_prefix || ""}
              onChange={(e) => setConfig({ ...config, billing_table_prefix: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Billing table prefix (default: gcp_billing_export_v1)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regions">Regions</Label>
            <Input
              id="regions"
              placeholder="us-central1, us-east1, europe-west1"
              value={regionsInput}
              onChange={(e) => setRegionsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of GCP regions to audit
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Configuration
          </CardTitle>
          <CardDescription>Configure AI-powered insights using Groq</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Status */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI Features:</span>
              {aiStatus ? (
                <Badge variant={aiStatus.enabled ? "default" : "secondary"}>
                  {aiStatus.enabled ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Disabled
                    </>
                  )}
                </Badge>
              ) : (
                <Badge variant="secondary">Unknown</Badge>
              )}
            </div>
            
            {aiStatus && !aiStatus.enabled && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  To enable AI features, set the <code className="font-mono">GROQ_API_KEY</code> environment variable.
                  Get your free API key at{" "}
                  <a 
                    href="https://console.groq.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    console.groq.com
                  </a>
                </AlertDescription>
              </Alert>
            )}
            
            {aiStatus?.enabled && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Provider:</span>
                <span className="text-sm text-muted-foreground">{aiStatus.provider}</span>
              </div>
            )}
            
            {aiStatus?.enabled && aiStatus.model && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Model:</span>
                <code className="text-xs text-muted-foreground">{aiStatus.model}</code>
              </div>
            )}
          </div>

          {/* Model Selection */}
          {aiStatus?.enabled && aiModels && (
            <div className="space-y-4">
              {modelMessage && (
                <div
                  className={`rounded-md border p-3 text-sm ${
                    modelMessage.type === "success"
                      ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
                      : "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
                  }`}
                >
                  {modelMessage.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select 
                  value={selectedModel} 
                  onValueChange={handleModelChange}
                  disabled={savingModel}
                >
                  <SelectTrigger id="ai-model">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          {model.recommended && (
                            <Badge variant="secondary" className="text-xs">Recommended</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedModel && aiModels.models.find(m => m.id === selectedModel) && (
                  <div className="rounded-md bg-muted p-3 text-xs">
                    <p className="font-medium mb-1">
                      {aiModels.models.find(m => m.id === selectedModel)?.name}
                    </p>
                    <p className="text-muted-foreground">
                      {aiModels.models.find(m => m.id === selectedModel)?.description}
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Context window: {aiModels.models.find(m => m.id === selectedModel)?.context_window.toLocaleString()} tokens
                    </p>
                  </div>
                )}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Note:</strong> Model changes are session-only. To persist the model selection, 
                  set the <code className="font-mono">GROQ_MODEL</code> environment variable in your <code className="font-mono">.env</code> file.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
          <CardDescription>Backend API endpoint details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">API URL</Label>
            <code className="block rounded-md bg-secondary px-3 py-2 text-sm">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
            </code>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Documentation</Label>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary hover:underline"
            >
              Open API Documentation →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
