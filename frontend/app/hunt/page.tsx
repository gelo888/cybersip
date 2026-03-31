"use client"

import { Suspense } from "react"
import { KanbanBoard } from "./components/kanban-board"

function KanbanFallback() {
    return (
        <div className="overflow-x-auto pb-4">
            <div className="inline-flex gap-4 min-w-max">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-72 shrink-0">
                        <div className="rounded-t-lg bg-muted/50 border border-b-0 px-3 py-2.5 h-14 animate-pulse" />
                        <div className="rounded-b-lg border bg-muted/20 p-2 min-h-[200px] space-y-2">
                            <div className="h-24 rounded-lg bg-muted/40 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function HuntPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hunt</h1>
                    <p className="text-sm text-muted-foreground">Pipeline engagements by stage</p>
                </div>
            </div>

            <Suspense fallback={<KanbanFallback />}>
                <KanbanBoard />
            </Suspense>
        </div>
    )
}
