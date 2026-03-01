import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type {
    Competitor,
    CompetitorPayload,
    CompetitorUpdatePayload,
} from "@/lib/types";

export function useCompetitors(take = 200) {
    return useQuery({
        queryKey: ["competitors"],
        queryFn: () => get<Competitor[]>(`/api/competitors?take=${take}`),
    });
}

export function useCreateCompetitor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CompetitorPayload) =>
            post<Competitor>("/api/competitors", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["competitors"] }),
    });
}

export function useUpdateCompetitor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CompetitorUpdatePayload }) =>
            patch<Competitor>(`/api/competitors/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["competitors"] }),
    });
}

export function useDeleteCompetitor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/competitors/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["competitors"] });
            qc.invalidateQueries({ queryKey: ["intel"] });
        },
    });
}
