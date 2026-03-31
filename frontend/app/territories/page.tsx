"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, List, Map, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTerritories, useDeleteTerritory } from "@/hooks/use-territories";
import type { Territory } from "@/lib/types";
import { TerritoryListView } from "./components/territory-list-view";
import { TerritoryMapView } from "./components/territory-map-view";
import { TerritoryFormDialog } from "./components/territory-form-dialog";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { TeamAssignmentDialog } from "./components/team-assignment-dialog";
import {
    TerritoriesListSkeleton,
    TerritoriesMapSkeleton,
} from "./components/territories-view-skeleton";

type ViewMode = "map" | "list";

export default function TerritoriesPage() {
    const [view, setView] = useState<ViewMode>("map");
    const [formOpen, setFormOpen] = useState(false);
    const [editTerritory, setEditTerritory] = useState<Territory | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Territory | null>(null);
    const [teamTarget, setTeamTarget] = useState<Territory | null>(null);

    const { data: territories = [], isLoading } = useTerritories();
    const deleteMutation = useDeleteTerritory();

    function handleEdit(territory: Territory) {
        setEditTerritory(territory);
        setFormOpen(true);
    }

    function handleNewTerritory() {
        setEditTerritory(null);
        setFormOpen(true);
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        await deleteMutation.mutateAsync(deleteTarget.id);
        setDeleteTarget(null);
    }

    return (
        <div className="space-y-10 p-6">
            <div>
                <nav className="text-primary/70 mb-2 flex flex-wrap items-center gap-2 text-xs font-bold tracking-widest uppercase">
                    <Link href="/" className="hover:text-primary">
                        Command center
                    </Link>
                    <ChevronRight className="size-3 opacity-60" aria-hidden />
                    <span className="text-primary">Territories</span>
                </nav>
                <h1 className="font-(family-name:--font-lexend) text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                    Coverage & regions
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                    Map and list views for territory hierarchy, segments, and team
                    assignments — data from{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                        /api/regions
                    </code>{" "}
                    and related APIs.
                </p>
            </div>

            <div className="bg-card overflow-hidden rounded-lg shadow-sm ring-1 ring-border/40">
                <div className="bg-primary h-0.5 w-full shrink-0" aria-hidden />
                <div className="flex flex-col gap-4 border-b border-border/50 bg-muted/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-muted/25">
                    <div className="flex min-w-0 items-center gap-2">
                        <Map className="size-4 shrink-0 text-primary" aria-hidden />
                        <span className="font-(family-name:--font-lexend) text-sm font-semibold tracking-tight text-foreground">
                            View
                        </span>
                        {!isLoading ? (
                            <span className="text-muted-foreground text-xs tabular-nums">
                                {territories.length} territor
                                {territories.length === 1 ? "y" : "ies"}
                            </span>
                        ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="bg-muted/80 flex items-center rounded-md p-0.5 ring-1 ring-border/40">
                            <Button
                                variant={view === "map" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 gap-1.5"
                                onClick={() => setView("map")}
                            >
                                <Map className="size-3.5" />
                                Map
                            </Button>
                            <Button
                                variant={view === "list" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 gap-1.5"
                                onClick={() => setView("list")}
                            >
                                <List className="size-3.5" />
                                List
                            </Button>
                        </div>
                        <Button size="sm" className="gap-1.5" onClick={handleNewTerritory}>
                            <Plus className="size-3.5" />
                            New territory
                        </Button>
                    </div>
                </div>
                <div className="p-4">
                    {isLoading ? (
                        view === "map" ? (
                            <TerritoriesMapSkeleton />
                        ) : (
                            <TerritoriesListSkeleton />
                        )
                    ) : view === "map" ? (
                        <TerritoryMapView territories={territories} />
                    ) : (
                        <TerritoryListView
                            territories={territories}
                            onEdit={handleEdit}
                            onDelete={setDeleteTarget}
                            onManageTeams={setTeamTarget}
                        />
                    )}
                </div>
            </div>

            <TerritoryFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                editTerritory={editTerritory}
            />

            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                territoryName={deleteTarget?.name ?? ""}
                onConfirm={handleDeleteConfirm}
                isPending={deleteMutation.isPending}
            />

            {teamTarget && (
                <TeamAssignmentDialog
                    open={!!teamTarget}
                    onOpenChange={(open) => !open && setTeamTarget(null)}
                    territory={
                        territories.find((t) => t.id === teamTarget.id) ?? teamTarget
                    }
                />
            )}
        </div>
    );
}
