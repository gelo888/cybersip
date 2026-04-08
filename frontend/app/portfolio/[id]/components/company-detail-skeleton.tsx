import { Skeleton } from "@/components/ui/skeleton";

export function CompanyDetailSkeleton() {
    return (
        <div className="space-y-10 p-6">
            <Skeleton className="h-9 w-40" />

            <div className="space-y-2">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-4 w-full max-w-xl" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                    <Skeleton className="h-0.5 w-full rounded-none" />
                    <div className="flex gap-4">
                        <Skeleton className="size-16 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-8 w-2/3 max-w-md" />
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-full max-w-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 rounded-lg" />
                        ))}
                    </div>
                </div>
                <Skeleton className="h-80 rounded-lg lg:col-span-4" />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="space-y-10 lg:col-span-8">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-40 w-full rounded-xl" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-36 w-full rounded-xl" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                </div>
                <div className="space-y-4 lg:col-span-4">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
