"use client"

/**
 * BUDGETS PAGE - PLACEHOLDER DATA
 * 
 * This page currently uses sample data from @/lib/sample-data
 * Backend API support for budgets is not implemented yet.
 * 
 * To implement real budgets:
 * 1. Add budget endpoints to gcp_finops_dashboard/api.py
 * 2. Create budget management in GCP Cloud Billing API
 * 3. Update this page to fetch from apiClient.getBudgets()
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { budgets, fmtCurrency } from "@/lib/sample-data"
import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

export default function BudgetsPage() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative space-y-4">
      {/* Placeholder notice */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">Placeholder Data</p>
            <p>
              This page displays sample budget data. Budget management via the API is not yet implemented. 
              You can manage budgets directly in the{" "}
              <a 
                href="https://console.cloud.google.com/billing/budgets" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-yellow-900 dark:hover:text-yellow-100"
              >
                Google Cloud Console
              </a>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((b) => {
          const pct = Math.min(100, Math.round((b.spend / b.limit) * 100))
          const atRisk = b.forecast > b.limit
          return (
            <Card key={b.name}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{b.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {fmtCurrency(b.spend)} / {fmtCurrency(b.limit)}
                </div>
                <Progress value={pct} aria-label={`${pct}% of budget used`} />
                <div className="flex items-center justify-between text-sm">
                  <div className={atRisk ? "text-destructive" : "text-primary"}>{atRisk ? "At risk" : "On track"}</div>
                  <div className="text-muted-foreground">Forecast: {fmtCurrency(b.forecast)}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-6 right-6 h-12 w-12 rounded-full p-0 text-2xl" aria-label="Create budget">
            +
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Budget name" />
            <Input placeholder="Limit (USD)" type="number" />
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
