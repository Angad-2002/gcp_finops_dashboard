"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { KeyboardShortcuts } from "../keyboard-shortcuts"

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <Topbar />
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 md:grid-cols-[16rem_1fr] lg:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-[calc(100dvh-3.5rem)] p-3 md:p-6">{children}</main>
      </div>
      <KeyboardShortcuts />
    </div>
  )
}
