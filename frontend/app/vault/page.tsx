"use client"

import { ContractsTable } from "./components/contracts-table"

export default function VaultPage() {
    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Vault</h1>
                <p className="text-sm text-muted-foreground">Contracts &amp; proposals lifecycle</p>
            </div>

            <ContractsTable />
        </div>
    )
}
