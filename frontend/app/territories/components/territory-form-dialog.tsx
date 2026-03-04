"use client";

import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useGeoRegions,
    useGeoSubRegions,
    useGeoCountries,
    useCountriesByLevel,
    useAdminDivisions,
    useAdminDivisions2,
} from "@/hooks/use-geo-data";
import { useSegmentLabels, useCreateTerritory, useUpdateTerritory } from "@/hooks/use-territories";
import type { Territory, TerritoryChild, TerritoryPayload } from "@/lib/types";

interface TerritoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editTerritory?: Territory | null;
}

type Step = 1 | 2 | 3 | 4;

const PRESET_COLORS = [
    "#d22d2d", "#2dd25d", "#8d2dd2", "#d2be2d", "#2db8d2",
    "#d26f2d", "#2d5dd2", "#d22da5", "#5dd22d", "#d2522d",
    "#2dd2b8", "#a52dd2",
];

export function TerritoryFormDialog({
    open,
    onOpenChange,
    editTerritory,
}: TerritoryFormDialogProps) {
    const isEdit = !!editTerritory;

    const [step, setStep] = useState<Step>(1);
    const [name, setName] = useState("");
    const [level, setLevel] = useState<number>(0);
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
    const [regionId, setRegionId] = useState<string | null>(null);
    const [subregionId, setSubregionId] = useState<string | null>(null);
    const [gid0, setGid0] = useState<string | null>(null);
    const [gid1, setGid1] = useState<string | null>(null);
    const [selectedChildren, setSelectedChildren] = useState<TerritoryChild[]>([]);

    const { data: geoRegions } = useGeoRegions();
    const { data: subRegions } = useGeoSubRegions(regionId);
    const { data: countries } = useGeoCountries(subregionId);
    const { data: countriesByLevel } = useCountriesByLevel();
    const { data: adminDivisions1 } = useAdminDivisions(level >= 1 ? gid0 : null);
    const { data: adminDivisions2 } = useAdminDivisions2(
        level === 2 ? gid0 : null,
        level === 2 ? gid1 : null,
    );
    const { data: segmentLabels } = useSegmentLabels();

    const createMutation = useCreateTerritory();
    const updateMutation = useUpdateTerritory();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const [prevOpen, setPrevOpen] = useState(false);
    if (open && !prevOpen) {
        setPrevOpen(true);
        if (editTerritory) {
            setName(editTerritory.name);
            setLevel(editTerritory.level);
            setColor(editTerritory.color);
            setSelectedSegments(editTerritory.segments.map((s) => s.id));
            setRegionId(editTerritory.region_id);
            setSubregionId(editTerritory.subregion_id);
            setGid0(editTerritory.gid_0);
            setGid1(editTerritory.gid_1);
            setSelectedChildren(editTerritory.children);
            setStep(1);
        } else {
            setName("");
            setLevel(0);
            setColor(PRESET_COLORS[0]);
            setSelectedSegments([]);
            setRegionId(null);
            setSubregionId(null);
            setGid0(null);
            setGid1(null);
            setSelectedChildren([]);
            setStep(1);
        }
    }
    if (!open && prevOpen) {
        setPrevOpen(false);
    }

    const filteredCountries = useMemo(() => {
        if (!countries || !countriesByLevel) return countries ?? [];
        if (level === 0) return countries;
        const levelKey = level === 1 ? "level_1" : "level_2";
        const allowedCodes = new Set(countriesByLevel[levelKey]);
        return countries.filter((c) => allowedCodes.has(c.id));
    }, [countries, countriesByLevel, level]);

    const childOptions = useMemo(() => {
        if (level === 0) {
            return (countries ?? []).map((c) => ({ id: c.id, name: c.name }));
        }
        if (level === 1) {
            return (adminDivisions1 ?? []).map((d) => ({ id: d.gid, name: d.name }));
        }
        return (adminDivisions2 ?? []).map((d) => ({ id: d.gid, name: d.name }));
    }, [level, countries, adminDivisions1, adminDivisions2]);

    function toggleSegment(id: string) {
        setSelectedSegments((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
        );
    }

    function toggleChild(child: TerritoryChild) {
        setSelectedChildren((prev) => {
            const exists = prev.some((c) => c.id === child.id);
            return exists ? prev.filter((c) => c.id !== child.id) : [...prev, child];
        });
    }

    function toggleAllChildren() {
        if (selectedChildren.length === childOptions.length) {
            setSelectedChildren([]);
        } else {
            setSelectedChildren([...childOptions]);
        }
    }

    const canProceedStep1 = name.trim().length > 0;
    const canProceedStep2 = !!regionId && !!subregionId;
    const canProceedStep3 =
        level === 0 || (level === 1 && !!gid0) || (level === 2 && !!gid0 && !!gid1);
    const canSubmit = selectedChildren.length > 0;

    async function handleSubmit() {
        const payload: TerritoryPayload = {
            name: name.trim(),
            level,
            color,
            region_id: regionId!,
            subregion_id: subregionId!,
            gid_0: level >= 1 ? gid0 : null,
            gid_1: level === 2 ? gid1 : null,
            children: selectedChildren,
            segment_label_ids: selectedSegments,
        };

        if (isEdit && editTerritory) {
            await updateMutation.mutateAsync({ id: editTerritory.id, data: payload });
        } else {
            await createMutation.mutateAsync(payload);
        }
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Territory" : "New Territory"} &mdash; Step{" "}
                        {step} of 4
                    </DialogTitle>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Northern California"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Level</Label>
                            <Select
                                value={String(level)}
                                onValueChange={(v) => {
                                    setLevel(Number(v));
                                    setGid0(null);
                                    setGid1(null);
                                    setSelectedChildren([]);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">
                                        Level 0 &mdash; Country
                                    </SelectItem>
                                    <SelectItem value="1">
                                        Level 1 &mdash; State / Province
                                    </SelectItem>
                                    <SelectItem value="2">
                                        Level 2 &mdash; County / District
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`size-7 rounded-md border-2 transition-all ${
                                            color === c
                                                ? "border-foreground scale-110"
                                                : "border-transparent"
                                        }`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                    />
                                ))}
                                <Input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="size-7 p-0 border-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Segments</Label>
                            <div className="flex flex-wrap gap-2">
                                {(segmentLabels ?? []).map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => toggleSegment(s.id)}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                                            selectedSegments.includes(s.id)
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-muted border-transparent hover:border-border"
                                        }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Region</Label>
                            <Select
                                value={regionId ?? ""}
                                onValueChange={(v) => {
                                    setRegionId(v);
                                    setSubregionId(null);
                                    setGid0(null);
                                    setGid1(null);
                                    setSelectedChildren([]);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a region" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(geoRegions ?? []).map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Sub-region</Label>
                            <Select
                                value={subregionId ?? ""}
                                onValueChange={(v) => {
                                    setSubregionId(v);
                                    setGid0(null);
                                    setGid1(null);
                                    setSelectedChildren([]);
                                }}
                                disabled={!regionId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a sub-region" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(subRegions ?? []).map((sr) => (
                                        <SelectItem key={sr.id} value={sr.id}>
                                            {sr.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        {level >= 1 && (
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Select
                                    value={gid0 ?? ""}
                                    onValueChange={(v) => {
                                        setGid0(v);
                                        setGid1(null);
                                        setSelectedChildren([]);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredCountries.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filteredCountries.length === 0 && subregionId && (
                                    <p className="text-xs text-muted-foreground">
                                        No countries with Level {level} data in this
                                        sub-region.
                                    </p>
                                )}
                            </div>
                        )}

                        {level === 2 && (
                            <div className="space-y-2">
                                <Label>State / Province</Label>
                                <Select
                                    value={gid1 ?? ""}
                                    onValueChange={(v) => {
                                        setGid1(v);
                                        setSelectedChildren([]);
                                    }}
                                    disabled={!gid0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a state/province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(adminDivisions1 ?? []).map((d) => (
                                            <SelectItem key={d.gid} value={d.gid}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {level === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Level 0 territories select countries directly. Proceed
                                to the next step to pick countries.
                            </p>
                        )}
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>
                                Select areas ({selectedChildren.length} /{" "}
                                {childOptions.length})
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleAllChildren}
                                className="text-xs h-7"
                            >
                                {selectedChildren.length === childOptions.length
                                    ? "Deselect all"
                                    : "Select all"}
                            </Button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto border rounded-md p-2 space-y-1">
                            {childOptions.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No areas available. Check your selections in
                                    previous steps.
                                </p>
                            )}
                            {childOptions.map((child) => {
                                const isSelected = selectedChildren.some(
                                    (c) => c.id === child.id,
                                );
                                return (
                                    <label
                                        key={child.id}
                                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors ${
                                            isSelected
                                                ? "bg-primary/10"
                                                : "hover:bg-muted"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleChild(child)}
                                            className="accent-primary"
                                        />
                                        <span>{child.name}</span>
                                        <span className="text-[10px] text-muted-foreground ml-auto">
                                            {child.id}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                <DialogFooter className="flex justify-between gap-2 sm:justify-between">
                    <div>
                        {step > 1 && (
                            <Button
                                variant="outline"
                                onClick={() => setStep((s) => (s - 1) as Step)}
                            >
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        {step < 4 ? (
                            <Button
                                onClick={() => setStep((s) => (s + 1) as Step)}
                                disabled={
                                    (step === 1 && !canProceedStep1) ||
                                    (step === 2 && !canProceedStep2) ||
                                    (step === 3 && !canProceedStep3)
                                }
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={!canSubmit || isPending}
                            >
                                {isPending
                                    ? "Saving..."
                                    : isEdit
                                      ? "Update"
                                      : "Create"}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
