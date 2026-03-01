import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type { Stage, StagePayload } from "@/lib/types";

export function useStages() {
    return useQuery({
        queryKey: ["stages"],
        queryFn: () => get<Stage[]>("/api/stages"),
    });
}

export function useCreateStage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: StagePayload) => post<Stage>("/api/stages", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["stages"] }),
    });
}

export function useUpdateStage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<StagePayload> }) =>
            patch<Stage>(`/api/stages/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["stages"] }),
    });
}

export function useDeleteStage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/stages/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["stages"] }),
    });
}
