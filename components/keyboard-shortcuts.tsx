"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function KeyboardShortcuts() {
  const { toast } = useToast()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key.toLowerCase() === "r") {
        e.preventDefault()
        location.reload()
      }
      if (ctrl && e.key.toLowerCase() === "e") {
        e.preventDefault()
        toast({
          title: "Export",
          description: "Open the Export menu in the top bar to choose a format.",
        })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toast])

  return null
}
