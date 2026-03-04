import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type {
    Territory,
    TerritoryPayload,
    TerritoryUpdatePayload,
    SegmentLabel,
    SegmentLabelPayload,
} from "@/lib/types";

export function useTerritories(params?: { region_id?: string; level?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.region_id) searchParams.set("region_id", params.region_id);
    if (params?.level !== undefined) searchParams.set("level", String(params.level));
    searchParams.set("take", "200");
    const qs = searchParams.toString();

    return useQuery({
        queryKey: ["territories", "list", params],
        queryFn: () => get<Territory[]>(`/api/territories?${qs}`),
    });
}

export function useTerritory(id: string | null) {
    return useQuery({
        queryKey: ["territories", "detail", id],
        queryFn: () => get<Territory>(`/api/territories/${id}`),
        enabled: !!id,
    });
}

export function useCreateTerritory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: TerritoryPayload) =>
            post<Territory>("/api/territories", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["territories"] }),
    });
}

export function useUpdateTerritory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TerritoryUpdatePayload }) =>
            patch<Territory>(`/api/territories/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["territories"] }),
    });
}

export function useDeleteTerritory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/territories/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["territories"] }),
    });
}

export function useSegmentLabels() {
    return useQuery({
        queryKey: ["segment-labels"],
        queryFn: () => get<SegmentLabel[]>("/api/segment-labels"),
    });
}

export function useCreateSegmentLabel() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: SegmentLabelPayload) =>
            post<SegmentLabel>("/api/segment-labels", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["segment-labels"] }),
    });
}
