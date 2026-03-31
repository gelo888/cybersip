import { Skeleton } from "@/components/ui/skeleton"

export function TerritoriesMapSkeleton() {
    return (
        <div className="rounded-lg border overflow-hidden min-h-[420px]">
            <Skeleton className="h-full min-h-[420px] w-full rounded-none" />
        </div>
    )
}

export function TerritoriesListSkeleton() {
    return (
        <div className="rounded-lg border divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="space-y-2 min-w-0 flex-1">
                        <Skeleton className="h-4 w-48 max-w-full" />
                        <Skeleton className="h-3 w-32 max-w-full" />
                    </div>
                    <Skeleton className="h-8 w-20 shrink-0" />
                </div>
            ))}
        </div>
    )
}
