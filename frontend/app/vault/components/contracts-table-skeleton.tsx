import { FileSignature } from "lucide-react";

import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Matches KPI strip + toolbar + contracts table layout */
export function ContractsTableSkeleton() {
    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-lg" />
                ))}
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileSignature className="text-primary size-5" />
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-8 w-28" />
                </div>
                <div className="overflow-hidden rounded-xl border border-border/60">
                    <div className="border-border/50 bg-muted/30 border-b px-4 py-4">
                        <Skeleton className="mb-3 h-3 w-32" />
                        <div className="flex flex-wrap gap-3">
                            <Skeleton className="h-9 max-w-md flex-1" />
                            <Skeleton className="h-9 w-36" />
                            <Skeleton className="h-9 w-40" />
                        </div>
                    </div>
                    <DataTableSkeleton rows={6} columns={9} />
                </div>
            </section>
        </>
    );
}
