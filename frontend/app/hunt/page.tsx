"use client"

import { KanbanBoard } from "./components/kanban-board"

export default function HuntPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hunt</h1>
                    <p className="text-sm text-muted-foreground">Pipeline engagements by stage</p>
                </div>
            </div>

            <KanbanBoard />
        </div>
    )
}
