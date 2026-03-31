import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DataTableSkeleton({
    rows = 8,
    columns,
    className,
}: {
    rows?: number;
    columns: number;
    className?: string;
}) {
    return (
        <div className={cn("overflow-x-auto rounded-lg border", className)}>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-muted/40">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="px-4 py-3 text-left font-medium">
                                <Skeleton className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, r) => (
                        <tr key={r} className="border-b last:border-b-0">
                            {Array.from({ length: columns }).map((_, c) => (
                                <td key={c} className="px-4 py-3">
                                    <Skeleton
                                        className={cn(
                                            "h-4",
                                            c === 0 ? "w-36" : "w-full max-w-[7rem]",
                                        )}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
