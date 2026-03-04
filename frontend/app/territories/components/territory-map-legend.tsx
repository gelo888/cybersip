"use client";

import type { Territory } from "@/lib/types";

interface TerritoryMapLegendProps {
    territories: Territory[];
}

const LEVEL_LABELS: Record<number, string> = {
    0: "Country",
    1: "State/Province",
    2: "County/District",
};

export function TerritoryMapLegend({ territories }: TerritoryMapLegendProps) {
    if (territories.length === 0) return null;

    return (
        <div className="absolute bottom-3 left-3 z-10 bg-background/90 backdrop-blur-sm border rounded-lg p-3 shadow-md max-h-[280px] overflow-y-auto min-w-[180px]">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
                Territories ({territories.length})
            </p>
            <div className="space-y-1.5">
                {territories.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                        <div
                            className="size-3 rounded-sm shrink-0 border"
                            style={{ backgroundColor: t.color, borderColor: t.color }}
                        />
                        <span className="text-xs truncate">{t.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                            {LEVEL_LABELS[t.level] ?? `L${t.level}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
