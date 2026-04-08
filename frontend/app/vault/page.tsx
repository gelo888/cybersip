"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ContractsTable } from "./components/contracts-table";

export default function VaultPage() {
    return (
        <div className="space-y-10 p-6">
            <div>
                <nav className="text-primary/70 mb-2 flex flex-wrap items-center gap-2 text-xs font-bold tracking-widest uppercase">
                    <Link href="/" className="hover:text-primary">
                        Command center
                    </Link>
                    <ChevronRight className="size-3 opacity-60" aria-hidden />
                    <span className="text-primary">Vault</span>
                </nav>
                <h1 className="font-(family-name:--font-lexend) text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                    Contract vault
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                    Renewal exposure, active value, and pipeline links — KPIs
                    reflect the loaded batch (honest when the list is small).
                </p>
            </div>

            <ContractsTable />
        </div>
    );
}
