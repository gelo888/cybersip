import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type {
    CompetitorIntel,
    IntelPayload,
    IntelUpdatePayload,
    IntelConfidence,
} from "@/lib/types";

interface IntelListParams {
    companyId?: string;
    competitorId?: string;
    confidence?: IntelConfidence;
    take?: number;
}

export function useIntel(params: IntelListParams = {}) {
    const { companyId, competitorId, confidence, take = 500 } = params;
    const sp = new URLSearchParams();
    if (companyId) sp.set("company_id", companyId);
    if (competitorId) sp.set("competitor_id", competitorId);
    if (confidence) sp.set("confidence", confidence);
    sp.set("take", String(take));
    const qs = sp.toString();

    return useQuery({
        queryKey: ["intel", { companyId, competitorId, confidence, take }],
        queryFn: () => get<CompetitorIntel[]>(`/api/intel?${qs}`),
    });
}

export function useCreateIntel() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: IntelPayload) =>
            post<CompetitorIntel>("/api/intel", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["intel"] }),
    });
}

export function useUpdateIntel() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: IntelUpdatePayload }) =>
            patch<CompetitorIntel>(`/api/intel/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["intel"] }),
    });
}

export function useDeleteIntel() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/intel/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["intel"] }),
    });
}
