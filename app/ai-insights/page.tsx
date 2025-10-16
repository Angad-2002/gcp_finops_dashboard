"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { apiClient, AIStatus } from "@/lib/api-client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Sparkles, Brain, TrendingUp, Target, DollarSign, BarChart3, MessageSquare, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"

export default function AIInsightsPage() {
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [question, setQuestion] = useState("")

  // Analysis states
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [costSpike, setCostSpike] = useState<any>(null)
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null)
  const [prioritization, setPrioritization] = useState<string | null>(null)
  const [budgetSuggestions, setBudgetSuggestions] = useState<string | null>(null)
  const [utilizationAnalysis, setUtilizationAnalysis] = useState<string | null>(null)
  const [qaAnswer, setQaAnswer] = useState<string | null>(null)

  useEffect(() => {
    checkAIStatus()
  }, [])

  const checkAIStatus = async () => {
    const response = await apiClient.getAIStatus()
    if (response.data) {
      setAiStatus(response.data)
    }
  }

  const handleAnalyzeDashboard = async () => {
    setLoading(true)
    setActiveTab("analysis")
    try {
      const response = await apiClient.getAIAnalysis()
      if (response.data) {
        setAnalysis(response.data.analysis)
      } else {
        setAnalysis(`Error: ${response.error}`)
      }
    } catch (error) {
      setAnalysis("Failed to generate analysis")
    }
    setLoading(false)
  }

  const handleExplainSpike = async () => {
    setLoading(true)
    setActiveTab("spike")
    try {
      const response = await apiClient.getAIExplainSpike()
      if (response.data) {
        setCostSpike(response.data)
      } else {
        setCostSpike({ explanation: `Error: ${response.error}` })
      }
    } catch (error) {
      setCostSpike({ explanation: "Failed to explain cost change" })
    }
    setLoading(false)
  }

  const handleExecutiveSummary = async () => {
    setLoading(true)
    setActiveTab("summary")
    try {
      const response = await apiClient.getAIExecutiveSummary()
      if (response.data) {
        setExecutiveSummary(response.data.summary)
      } else {
        setExecutiveSummary(`Error: ${response.error}`)
      }
    } catch (error) {
      setExecutiveSummary("Failed to generate summary")
    }
    setLoading(false)
  }

  const handlePrioritize = async () => {
    setLoading(true)
    setActiveTab("prioritize")
    try {
      const response = await apiClient.getAIPrioritizeRecommendations()
      if (response.data) {
        setPrioritization(response.data.prioritization)
      } else {
        setPrioritization(`Error: ${response.error}`)
      }
    } catch (error) {
      setPrioritization("Failed to prioritize recommendations")
    }
    setLoading(false)
  }

  const handleBudgetSuggestions = async () => {
    setLoading(true)
    setActiveTab("budget")
    try {
      const response = await apiClient.getAISuggestBudgets()
      if (response.data) {
        setBudgetSuggestions(response.data.suggestions)
      } else {
        setBudgetSuggestions(`Error: ${response.error}`)
      }
    } catch (error) {
      setBudgetSuggestions("Failed to suggest budgets")
    }
    setLoading(false)
  }

  const handleUtilizationAnalysis = async () => {
    setLoading(true)
    setActiveTab("utilization")
    try {
      const response = await apiClient.getAIUtilizationAnalysis()
      if (response.data) {
        setUtilizationAnalysis(response.data.analysis)
      } else {
        setUtilizationAnalysis(`Error: ${response.error}`)
      }
    } catch (error) {
      setUtilizationAnalysis("Failed to analyze utilization")
    }
    setLoading(false)
  }

  const handleAskQuestion = async () => {
    if (!question.trim()) return

    setLoading(true)
    setActiveTab("qa")
    try {
      const response = await apiClient.askAI(question)
      if (response.data) {
        setQaAnswer(response.data.answer)
      } else {
        setQaAnswer(`Error: ${response.error}`)
      }
    } catch (error) {
      setQaAnswer("Failed to get answer")
    }
    setLoading(false)
  }

  if (!aiStatus) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!aiStatus.enabled) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">AI Features Not Enabled</div>
            <p className="text-sm text-muted-foreground">{aiStatus.message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              To enable AI insights, set the <code className="px-1 py-0.5 bg-muted rounded">GROQ_API_KEY</code> environment variable and restart the backend.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            AI Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Powered by {aiStatus.provider} - {aiStatus.model}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          AI Enabled
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-purple-500 transition-colors" onClick={handleAnalyzeDashboard}>
          <CardHeader className="pb-3">
            <Brain className="h-6 w-6 text-purple-500 mb-2" />
            <CardTitle className="text-base">Full Analysis</CardTitle>
            <CardDescription className="text-xs">Comprehensive cost insights</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={handleExplainSpike}>
          <CardHeader className="pb-3">
            <TrendingUp className="h-6 w-6 text-blue-500 mb-2" />
            <CardTitle className="text-base">Explain Costs</CardTitle>
            <CardDescription className="text-xs">Why costs changed</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-green-500 transition-colors" onClick={handlePrioritize}>
          <CardHeader className="pb-3">
            <Target className="h-6 w-6 text-green-500 mb-2" />
            <CardTitle className="text-base">Prioritize Actions</CardTitle>
            <CardDescription className="text-xs">What to fix first</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-orange-500 transition-colors" onClick={handleBudgetSuggestions}>
          <CardHeader className="pb-3">
            <DollarSign className="h-6 w-6 text-orange-500 mb-2" />
            <CardTitle className="text-base">Budget Alerts</CardTitle>
            <CardDescription className="text-xs">Smart threshold suggestions</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* More Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-cyan-500 transition-colors" onClick={handleUtilizationAnalysis}>
          <CardHeader className="pb-3">
            <BarChart3 className="h-6 w-6 text-cyan-500 mb-2" />
            <CardTitle className="text-base">Resource Utilization</CardTitle>
            <CardDescription className="text-xs">Analyze efficiency patterns</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-indigo-500 transition-colors" onClick={handleExecutiveSummary}>
          <CardHeader className="pb-3">
            <MessageSquare className="h-6 w-6 text-indigo-500 mb-2" />
            <CardTitle className="text-base">Executive Summary</CardTitle>
            <CardDescription className="text-xs">Brief stakeholder report</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Ask AI Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ask AI About Your Costs
          </CardTitle>
          <CardDescription>
            Ask natural language questions about your GCP spending and resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder='e.g., "Why are my Cloud Run costs so high?"'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
            />
            <Button onClick={handleAskQuestion} disabled={loading || !question.trim()}>
              {loading ? <Spinner className="h-4 w-4" /> : "Ask"}
            </Button>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Example: "What are my biggest cost drivers?" or "How many idle resources do I have?"
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Spinner className="h-8 w-8" />
              <p className="text-muted-foreground">Generating AI insights...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && activeTab === "analysis" && analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Full Dashboard Analysis
            </CardTitle>
            <CardDescription>AI-powered insights on your GCP costs and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {analysis || ""}
                    </ReactMarkdown>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && activeTab === "spike" && costSpike && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Cost Change Explanation
            </CardTitle>
            {costSpike.change_pct !== undefined && (
              <CardDescription>
                Costs {costSpike.change_pct > 0 ? "increased" : "decreased"} by {Math.abs(costSpike.change_pct).toFixed(1)}%
                (${costSpike.last_month?.toFixed(2)} → ${costSpike.current_month?.toFixed(2)})
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {costSpike.explanation || ""}
                    </ReactMarkdown>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && activeTab === "summary" && executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              Executive Summary
            </CardTitle>
            <CardDescription>Concise overview for stakeholders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="bg-muted p-4 rounded-lg">
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {executiveSummary || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && activeTab === "prioritize" && prioritization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Prioritized Recommendations
            </CardTitle>
            <CardDescription>Which optimizations to implement first</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="bg-muted p-4 rounded-lg">
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {prioritization || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && activeTab === "budget" && budgetSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
              Budget Alert Suggestions
            </CardTitle>
            <CardDescription>Recommended budget thresholds based on spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="bg-muted p-4 rounded-lg">
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {budgetSuggestions || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && activeTab === "utilization" && utilizationAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-500" />
              Resource Utilization Analysis
            </CardTitle>
            <CardDescription>Efficiency patterns and optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="bg-muted p-4 rounded-lg">
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {utilizationAnalysis || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && activeTab === "qa" && qaAnswer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Your Question
            </CardTitle>
            <CardDescription className="font-medium">{question}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="bg-muted p-4 rounded-lg">
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {qaAnswer || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setQuestion("")
                setQaAnswer(null)
                setActiveTab("overview")
              }}
            >
              Ask Another Question
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

