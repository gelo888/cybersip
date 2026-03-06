"use client";

import { Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Territory } from "@/lib/types";

interface TerritoryListViewProps {
    territories: Territory[];
    onEdit: (territory: Territory) => void;
    onDelete: (territory: Territory) => void;
    onManageTeams: (territory: Territory) => void;
}

const LEVEL_LABELS: Record<number, string> = {
    0: "Country",
    1: "State/Province",
    2: "County/District",
};

export function TerritoryListView({
    territories,
    onEdit,
    onDelete,
    onManageTeams,
}: TerritoryListViewProps) {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-muted/40">
                        <th className="px-4 py-3 text-left font-medium">Color</th>
                        <th className="px-4 py-3 text-left font-medium">Name</th>
                        <th className="px-4 py-3 text-left font-medium">Level</th>
                        <th className="px-4 py-3 text-left font-medium">Region</th>
                        <th className="px-4 py-3 text-left font-medium">Subregion</th>
                        <th className="px-4 py-3 text-left font-medium">Segments</th>
                        <th className="px-4 py-3 text-left font-medium">Members</th>
                        <th className="px-4 py-3 text-center font-medium">
                            Children
                        </th>
                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {territories.length === 0 && (
                        <tr>
                            <td
                                colSpan={9}
                                className="px-4 py-8 text-center text-muted-foreground"
                            >
                                No territories yet. Click &quot;New Territory&quot; to
                                create one.
                            </td>
                        </tr>
                    )}
                    {territories.map((t) => (
                        <tr
                            key={t.id}
                            className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                        >
                            <td className="px-4 py-3">
                                <div
                                    className="size-5 rounded-sm border"
                                    style={{
                                        backgroundColor: t.color,
                                        borderColor: t.color,
                                    }}
                                />
                            </td>
                            <td className="px-4 py-3 font-medium">{t.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {LEVEL_LABELS[t.level] ?? `L${t.level}`}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {t.region_id}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {t.subregion_id}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                    {t.segments.map((s) => (
                                        <span
                                            key={s.id}
                                            className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium"
                                        >
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                {(t.members?.length ?? 0) > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {t.members!.map((m) => (
                                            <span
                                                key={m.id}
                                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[11px] font-medium"
                                            >
                                                <Users className="size-2.5" />
                                                {m.first_name} {m.last_name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        &mdash;
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {t.children.length}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={() => onManageTeams(t)}
                                        title="Manage members"
                                    >
                                        <Users className="size-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={() => onEdit(t)}
                                    >
                                        <Pencil className="size-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-destructive"
                                        onClick={() => onDelete(t)}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
