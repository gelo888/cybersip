import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import type { Company, CompanyPayload, PaginatedResponse } from "@/lib/types";

interface CompanyListParams {
    page: number;
    pageSize: number;
}

export function useCompanies({ page, pageSize }: CompanyListParams) {
    const skip = page * pageSize;
    return useQuery({
        queryKey: ["companies", "list", { skip, take: pageSize }],
        queryFn: () => get<PaginatedResponse<Company>>(`/api/companies/?skip=${skip}&take=${pageSize}`),
        placeholderData: keepPreviousData,
    });
}

export function useCreateCompany() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyPayload) => post<Company>("/api/companies/", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
    });
}

export function useUpdateCompany() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CompanyPayload }) =>
            put<Company>(`/api/companies/${id}/`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
    });
}

export function useDeleteCompany() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => del(`/api/companies/${id}/`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
    });
}
