import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type { Engagement, EngagementPayload, EngagementUpdatePayload } from "@/lib/types";

interface EngagementListParams {
    companyId?: string;
    stageId?: string;
    take?: number;
}

export function useEngagements(params: EngagementListParams = {}) {
    const { companyId, stageId, take = 200 } = params;
    const searchParams = new URLSearchParams();
    if (companyId) searchParams.set("company_id", companyId);
    if (stageId) searchParams.set("stage_id", stageId);
    searchParams.set("take", String(take));
    const qs = searchParams.toString();

    return useQuery({
        queryKey: ["engagements", { companyId, stageId, take }],
        queryFn: () => get<Engagement[]>(`/api/engagements?${qs}`),
    });
}

export function useCreateEngagement() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: EngagementPayload) =>
            post<Engagement>("/api/engagements", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["engagements"] }),
    });
}

export function useUpdateEngagement() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: EngagementUpdatePayload }) =>
            patch<Engagement>(`/api/engagements/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["engagements"] }),
    });
}

export function useDeleteEngagement() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/engagements/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["engagements"] }),
    });
}
