import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function CompanyDetailSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-9 w-40" />

            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-11 shrink-0 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-24 rounded-md" />
                                <Skeleton className="h-5 w-20 rounded-md" />
                            </div>
                        </div>
                    </div>
                    <Skeleton className="h-4 w-40" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 rounded-lg border bg-card p-4"
                        >
                            <Skeleton className="size-9 shrink-0 rounded-md" />
                            <div className="space-y-2 flex-1 min-w-0">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-full max-w-[8rem]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-28 w-full rounded-lg" />
            </div>
        </div>
    )
}
