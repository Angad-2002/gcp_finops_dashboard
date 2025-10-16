/**
 * API Client for GCP FinOps Dashboard Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface DashboardSummary {
  current_month: number
  last_month: number
  ytd: number
  change_pct: number
  resources_active: number
  potential_savings: number
  project_id: string
  billing_month: string
}

export interface ServiceCost {
  name: string
  value: number
}

export interface CostTrendItem {
  month: string
  cost: number
  change: number
}

export interface AuditResult {
  resource_type: string
  total_count: number
  untagged_count: number
  idle_count: number
  over_provisioned_count: number
  issues: string[]
  potential_monthly_savings: number
}

export interface Recommendation {
  resource_type: string
  resource_name: string
  region: string
  issue: string
  recommendation: string
  potential_monthly_savings: number
  priority: "high" | "medium" | "low"
  details?: Record<string, any>
}

export interface ResourcesSummary {
  total: number
  running: number
  idle: number
  untagged: number
}

export interface DashboardData {
  project_id: string
  billing_month: string
  current_month_cost: number
  last_month_cost: number
  ytd_cost: number
  service_costs: Record<string, number>
  total_potential_savings: number
  audit_results: Record<string, AuditResult>
  recommendations: Recommendation[]
}

export interface HealthStatus {
  status: string
  timestamp: string
  configured: boolean
}

export interface ApiConfig {
  project_id?: string
  billing_dataset?: string
  billing_table_prefix?: string
  regions?: string[]
}

export interface Report {
  filename: string
  size: string
  size_bytes: number
  created_at: string
  download_url: string
  project_id?: string
}

export interface ReportsListResponse {
  reports: Report[]
  total: number
}

export interface GenerateReportResponse {
  success: boolean
  filename: string
  size: string
  size_bytes: number
  created_at: string
  download_url: string
  project_id: string
}

export interface AIStatus {
  enabled: boolean
  model: string | null
  provider: string
  message: string
}

export interface AIAnalysisResponse {
  success: boolean
  analysis: string
  model: string
  project_id: string
  billing_month: string
  generated_at: string
}

export interface AIExplainSpikeResponse {
  success: boolean
  explanation: string
  current_month: number
  last_month: number
  change_pct: number
}

export interface AIExecutiveSummaryResponse {
  success: boolean
  summary: string
  project_id: string
  billing_month: string
}

export interface AIAskResponse {
  success: boolean
  question: string
  answer: string
  generated_at: string
}

export interface AIPrioritizeResponse {
  success: boolean
  prioritization: string
  total_recommendations: number
}

export interface AISuggestBudgetsResponse {
  success: boolean
  suggestions: string
  current_month_cost: number
  ytd_cost: number
}

export interface AIUtilizationResponse {
  success: boolean
  analysis: string
  total_resources: number
  idle_resources: number
}

export interface AIModel {
  id: string
  name: string
  description: string
  context_window: number
  recommended: boolean
}

export interface AIModelsResponse {
  models: AIModel[]
  current_model: string
  default_model: string
}

export interface SetModelResponse {
  success: boolean
  model: string
  message: string
}

// Forecasting types
export interface ForecastPoint {
  date: string
  predicted_cost: number
  lower_bound: number
  upper_bound: number
}

export interface ForecastData {
  forecast_points: ForecastPoint[]
  total_predicted_cost: number
  forecast_days: number
  model_confidence: number
  trend: "increasing" | "decreasing" | "stable"
  generated_at: string
}

export interface ForecastSummary {
  predicted_cost_next_30d: number
  current_month_cost: number
  trend: "increasing" | "decreasing" | "stable"
  confidence: number
  forecast_days: number
}

export interface ServiceForecast extends ForecastData {
  service_name: string
}

export interface ForecastTrend {
  service_name: string
  current_cost: number
  predicted_cost_30d: number
  trend: "increasing" | "decreasing" | "stable"
  confidence: number
}

export interface ForecastTrendsResponse {
  trends: ForecastTrend[]
  generated_at: string
}

export interface AlertThresholdsResponse {
  predicted_monthly_cost: number
  recommended_thresholds: {
    conservative: number
    warning: number
    critical: number
  }
  confidence: number
  trend: "increasing" | "decreasing" | "stable"
  generated_at: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      return {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<HealthStatus>> {
    return this.fetch<HealthStatus>("/api/health")
  }

  /**
   * Get API configuration
   */
  async getConfig(): Promise<ApiResponse<ApiConfig>> {
    return this.fetch<ApiConfig>("/api/config")
  }

  /**
   * Update API configuration
   */
  async updateConfig(config: ApiConfig): Promise<ApiResponse<ApiConfig>> {
    return this.fetch<ApiConfig>("/api/config", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  /**
   * Get dashboard summary
   */
  async getSummary(): Promise<ApiResponse<DashboardSummary>> {
    return this.fetch<DashboardSummary>("/api/summary")
  }

  /**
   * Get service costs
   */
  async getServiceCosts(): Promise<ApiResponse<ServiceCost[]>> {
    return this.fetch<ServiceCost[]>("/api/costs/services")
  }

  /**
   * Get cost trend (6 months)
   */
  async getCostTrend(): Promise<ApiResponse<CostTrendItem[]>> {
    return this.fetch<CostTrendItem[]>("/api/costs/trend")
  }

  /**
   * Get all audit results
   */
  async getAudits(): Promise<ApiResponse<Record<string, AuditResult>>> {
    return this.fetch<Record<string, AuditResult>>("/api/audits")
  }

  /**
   * Get specific audit result
   */
  async getAudit(
    auditType: string,
    refresh = false
  ): Promise<ApiResponse<AuditResult>> {
    const query = refresh ? "?refresh=true" : ""
    return this.fetch<AuditResult>(`/api/audits/${auditType}${query}`)
  }

  /**
   * Get recommendations
   */
  async getRecommendations(params?: {
    priority?: string
    resource_type?: string
    limit?: number
  }): Promise<ApiResponse<Recommendation[]>> {
    const queryParams = new URLSearchParams()
    if (params?.priority) queryParams.append("priority", params.priority)
    if (params?.resource_type) queryParams.append("resource_type", params.resource_type)
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return this.fetch<Recommendation[]>(`/api/recommendations${query}`)
  }

  /**
   * Get resources summary
   */
  async getResourcesSummary(): Promise<ApiResponse<ResourcesSummary>> {
    return this.fetch<ResourcesSummary>("/api/resources/summary")
  }

  /**
   * Get complete dashboard data
   */
  async getDashboard(refresh = false): Promise<ApiResponse<DashboardData>> {
    const query = refresh ? "?refresh=true" : ""
    return this.fetch<DashboardData>(`/api/dashboard${query}`)
  }

  /**
   * Force refresh all data
   */
  async refreshData(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.fetch<{ status: string; timestamp: string }>("/api/refresh", {
      method: "POST",
    })
  }

  /**
   * Get list of all reports
   */
  async getReports(): Promise<ApiResponse<ReportsListResponse>> {
    return this.fetch<ReportsListResponse>("/api/reports")
  }

  /**
   * Generate a new report
   */
  async generateReport(format: string = "pdf"): Promise<ApiResponse<GenerateReportResponse>> {
    return this.fetch<GenerateReportResponse>(`/api/reports/generate?format=${format}`, {
      method: "POST",
    })
  }

  /**
   * Delete a report
   */
  async deleteReport(filename: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetch<{ success: boolean; message: string }>(`/api/reports/${filename}`, {
      method: "DELETE",
    })
  }

  /**
   * Get download URL for a report
   */
  getReportDownloadUrl(filename: string): string {
    return `${this.baseUrl}/api/reports/${filename}/download`
  }

  // ============================================================================
  // AI INSIGHTS ENDPOINTS
  // ============================================================================

  /**
   * Check AI features status
   */
  async getAIStatus(): Promise<ApiResponse<AIStatus>> {
    return this.fetch<AIStatus>("/api/ai/status")
  }

  /**
   * Get comprehensive AI analysis of dashboard data
   */
  async getAIAnalysis(refresh = false): Promise<ApiResponse<AIAnalysisResponse>> {
    const query = refresh ? "?refresh=true" : ""
    return this.fetch<AIAnalysisResponse>(`/api/ai/analyze${query}`, {
      method: "POST",
    })
  }

  /**
   * Get AI explanation for cost spikes
   */
  async getAIExplainSpike(): Promise<ApiResponse<AIExplainSpikeResponse>> {
    return this.fetch<AIExplainSpikeResponse>("/api/ai/explain-spike", {
      method: "POST",
    })
  }

  /**
   * Generate executive summary
   */
  async getAIExecutiveSummary(): Promise<ApiResponse<AIExecutiveSummaryResponse>> {
    return this.fetch<AIExecutiveSummaryResponse>("/api/ai/executive-summary", {
      method: "POST",
    })
  }

  /**
   * Ask a natural language question
   */
  async askAI(question: string): Promise<ApiResponse<AIAskResponse>> {
    return this.fetch<AIAskResponse>(`/api/ai/ask?question=${encodeURIComponent(question)}`, {
      method: "POST",
    })
  }

  /**
   * Get AI prioritization of recommendations
   */
  async getAIPrioritizeRecommendations(): Promise<ApiResponse<AIPrioritizeResponse>> {
    return this.fetch<AIPrioritizeResponse>("/api/ai/prioritize-recommendations", {
      method: "POST",
    })
  }

  /**
   * Get AI budget suggestions
   */
  async getAISuggestBudgets(): Promise<ApiResponse<AISuggestBudgetsResponse>> {
    return this.fetch<AISuggestBudgetsResponse>("/api/ai/suggest-budgets", {
      method: "POST",
    })
  }

  /**
   * Get AI utilization analysis
   */
  async getAIUtilizationAnalysis(): Promise<ApiResponse<AIUtilizationResponse>> {
    return this.fetch<AIUtilizationResponse>("/api/ai/analyze-utilization", {
      method: "POST",
    })
  }

  /**
   * Get available AI models
   */
  async getAIModels(): Promise<ApiResponse<AIModelsResponse>> {
    return this.fetch<AIModelsResponse>("/api/ai/models")
  }

  /**
   * Set AI model for analysis
   */
  async setAIModel(modelId: string): Promise<ApiResponse<SetModelResponse>> {
    return this.fetch<SetModelResponse>(`/api/ai/models/set?model_id=${encodeURIComponent(modelId)}`, {
      method: "POST",
    })
  }

  // ============================================================================
  // FORECASTING ENDPOINTS
  // ============================================================================

  /**
   * Get cost forecast
   */
  async getCostForecast(params?: {
    days?: number
    historical_days?: number
    refresh?: boolean
  }): Promise<ApiResponse<ForecastData>> {
    const queryParams = new URLSearchParams()
    if (params?.days) queryParams.append("days", params.days.toString())
    if (params?.historical_days) queryParams.append("historical_days", params.historical_days.toString())
    if (params?.refresh) queryParams.append("refresh", "true")

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return this.fetch<ForecastData>(`/api/forecast${query}`)
  }

  /**
   * Get forecast summary
   */
  async getForecastSummary(days = 30): Promise<ApiResponse<ForecastSummary>> {
    return this.fetch<ForecastSummary>(`/api/forecast/summary?days=${days}`)
  }

  /**
   * Get service-specific forecast
   */
  async getServiceForecast(
    serviceName: string,
    params?: {
      days?: number
      historical_days?: number
    }
  ): Promise<ApiResponse<ServiceForecast>> {
    const queryParams = new URLSearchParams()
    if (params?.days) queryParams.append("days", params.days.toString())
    if (params?.historical_days) queryParams.append("historical_days", params.historical_days.toString())

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return this.fetch<ServiceForecast>(`/api/forecast/service/${encodeURIComponent(serviceName)}${query}`)
  }

  /**
   * Get forecast trends for all major services
   */
  async getForecastTrends(): Promise<ApiResponse<ForecastTrendsResponse>> {
    return this.fetch<ForecastTrendsResponse>("/api/forecast/trends")
  }

  /**
   * Get recommended alert thresholds based on forecast
   */
  async getForecastAlertThresholds(): Promise<ApiResponse<AlertThresholdsResponse>> {
    return this.fetch<AlertThresholdsResponse>("/api/forecast/alert-thresholds")
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances
export default ApiClient

