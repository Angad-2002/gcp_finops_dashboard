"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, LineChart, Wallet, Server, TrendingUp, FileText, Settings, Sparkles } from "lucide-react"

const items = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/cost-analysis", label: "Cost Analysis", icon: LineChart },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/resources", label: "Resources", icon: Server },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/ai-insights", label: "AI Insights", icon: Sparkles },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside
      className="hidden md:flex md:w-64 lg:w-72 flex-col border-r bg-sidebar text-sidebar-foreground"
      aria-label="Primary"
    >
      <div className="h-14 shrink-0 flex items-center gap-2 px-4 border-b">
        <img src="/placeholder-logo.svg" alt="" aria-hidden="true" className="h-4 w-4" />
        <span className="font-semibold text-sm">GCP FinOps Dashboard</span>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm border-l-2 transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-sidebar-primary"
                      : "border-l-transparent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={cn("h-4 w-4", active ? "text-sidebar-primary" : "text-foreground/70")}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
