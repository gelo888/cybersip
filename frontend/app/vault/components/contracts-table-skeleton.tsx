import { FileSignature } from "lucide-react"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

/** Matches summary cards + contracts table layout in contracts-table.tsx */
export function ContractsTableSkeleton() {
    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-4 space-y-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                ))}
            </div>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileSignature className="size-5 text-primary" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-8 w-32" />
                </div>
                <DataTableSkeleton rows={6} columns={9} />
            </section>
        </>
    )
}
