"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

const ALL_PROJECTS = ["prod-core", "data-lake", "ml-lab", "shared-vpc", "dev-sandbox"]

export function Topbar() {
  const [selected, setSelected] = useState<string[]>(["prod-core", "data-lake"])
  const [range, setRange] = useState<string>("last-6m")
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch by only rendering theme toggle after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  function toggleProject(p: string) {
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  function onExport(fmt: "csv" | "json" | "pdf") {
    toast({
      title: "Export started",
      description: `Preparing ${fmt.toUpperCase()}...`,
    })
  }

  return (
    <header className="sticky top-0 z-30 h-14 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-3">
          <Image src="/placeholder-logo.svg" alt="GCP FinOps Dashboard" width={20} height={20} className="rounded-sm" />
          <span className="font-medium text-sm text-pretty">GCP FinOps Dashboard</span>
          <Separator orientation="vertical" className="h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" aria-label="Select projects">
                Projects{" "}
                <Badge className="ml-2" variant="outline">
                  {selected.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Projects</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_PROJECTS.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={selected.includes(p)}
                  onCheckedChange={() => toggleProject(p)}
                  aria-checked={selected.includes(p)}
                >
                  {p}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[160px]" aria-label="Select date range">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-30d">Last 30 days</SelectItem>
              <SelectItem value="last-3m">Last 3 months</SelectItem>
              <SelectItem value="last-6m">Last 6 months</SelectItem>
              <SelectItem value="last-12m">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => location.reload()} aria-label="Refresh">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" aria-label="Export menu">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export as</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <button className="px-2 py-1.5 text-left hover:bg-accent" onClick={() => onExport("csv")}>
                CSV
              </button>
              <button className="px-2 py-1.5 text-left hover:bg-accent" onClick={() => onExport("json")}>
                JSON
              </button>
              <button className="px-2 py-1.5 text-left hover:bg-accent" onClick={() => onExport("pdf")}>
                PDF
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>GF</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Signed in</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <button className="px-2 py-1.5 text-left hover:bg-accent">Profile</button>
              <button className="px-2 py-1.5 text-left hover:bg-accent">Settings</button>
              <DropdownMenuSeparator />
              <button className="px-2 py-1.5 text-left hover:bg-accent">Sign out</button>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            disabled={!mounted}
          >
            {mounted ? (
              theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
