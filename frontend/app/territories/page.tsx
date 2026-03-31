"use client";

import { useState } from "react";
import { Map, List, Plus } from "lucide-react";
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
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Map className="size-5 text-primary" />
                    <h2 className="text-lg font-semibold">Territories</h2>
                    {!isLoading && (
                        <span className="text-sm text-muted-foreground">
                            ({territories.length})
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-md border bg-muted p-0.5">
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
                        New Territory
                    </Button>
                </div>
            </div>

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
