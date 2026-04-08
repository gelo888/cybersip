"use client"

import { Suspense } from "react"
import { KanbanBoard } from "./components/kanban-board"

function KanbanFallback() {
    return (
        <div className="flex min-h-[50vh] flex-col">
            <div className="border-border/60 bg-muted/35 mb-4 h-20 animate-pulse border-b px-6 dark:bg-muted/20" />
            <div className="kanban-scroll-x flex-1 overflow-x-auto px-6 pb-6">
                <div className="inline-flex gap-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex w-80 shrink-0 flex-col">
                            <div className="h-16 animate-pulse rounded-t-xl border border-b-0 bg-muted/40" />
                            <div className="min-h-[240px] space-y-3 rounded-b-xl border bg-muted/20 p-3">
                                <div className="h-36 animate-pulse rounded-xl bg-muted/40" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function HuntPage() {
    return (
        <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
            <Suspense fallback={<KanbanFallback />}>
                <KanbanBoard />
            </Suspense>
        </div>
    )
}
