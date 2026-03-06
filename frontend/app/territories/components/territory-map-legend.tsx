"use client";

import { Users } from "lucide-react";
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
        <div className="absolute bottom-3 left-3 z-10 bg-background/90 backdrop-blur-sm border rounded-lg p-3 shadow-md max-h-[320px] overflow-y-auto min-w-[200px]">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
                Territories ({territories.length})
            </p>
            <div className="space-y-2">
                {territories.map((t) => (
                    <div key={t.id} className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <div
                                className="size-3 rounded-sm shrink-0 border"
                                style={{ backgroundColor: t.color, borderColor: t.color }}
                            />
                            <span className="text-xs truncate">{t.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">
                                {LEVEL_LABELS[t.level] ?? `L${t.level}`}
                            </span>
                        </div>
                        {(t.members ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 pl-5">
                                {t.members!.map((m) => (
                                    <span
                                        key={m.id}
                                        className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"
                                    >
                                        <Users className="size-2.5" />
                                        {m.first_name} {m.last_name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
