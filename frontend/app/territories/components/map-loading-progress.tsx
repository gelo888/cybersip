"use client";

interface MapLoadingProgressProps {
    loaded: number;
    total: number;
}

export function MapLoadingProgress({ loaded, total }: MapLoadingProgressProps) {
    if (total === 0 || loaded >= total) return null;

    const pct = Math.round((loaded / total) * 100);

    return (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm border rounded-lg px-4 py-2 shadow-md flex items-center gap-3 min-w-[220px]">
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
                {loaded + 1} / {total} territories
            </span>
        </div>
    );
}
